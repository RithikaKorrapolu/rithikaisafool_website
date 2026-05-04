import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { sendMessage, sendMessageSafe, sendReaction } from './linq-client';
import { logAIDecision } from './logger';
import { fullModerationCheck } from './moderation';
import { TRIAL_DURATION_DAYS } from './constants';
import { Contact } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// STATE MACHINE - App owns the sequence
// ============================================

export type OnboardingState =
  | 'initial_welcome'
  | 'ask_name'
  | 'explain_how_it_works'
  | 'ask_start_confirmation'
  | 'q_best_compliment'
  | 'q_random_moment'
  | 'q_oddly_proud'
  | 'q_didnt_make_sense'
  | 'q_two_things'
  | 'q_anything_else'
  | 'onboarding_complete'
  | 'paused';

// State transitions - app decides this, not Claude
const STATE_FLOW: Record<OnboardingState, OnboardingState | null> = {
  'initial_welcome': 'ask_name',
  'ask_name': 'explain_how_it_works',
  'explain_how_it_works': 'ask_start_confirmation',
  'ask_start_confirmation': 'q_best_compliment', // or 'paused' if they say no
  'q_best_compliment': 'q_random_moment',
  'q_random_moment': 'q_oddly_proud',
  'q_oddly_proud': 'q_didnt_make_sense',
  'q_didnt_make_sense': 'q_two_things',
  'q_two_things': 'q_anything_else',
  'q_anything_else': 'onboarding_complete',
  'onboarding_complete': null,
  'paused': null,
};

// Questions for each state
const STATE_QUESTIONS: Record<string, string> = {
  'q_best_compliment': "What's the best compliment you've ever gotten?",
  'q_random_moment': "Tell me about a random moment you still think about sometimes.",
  'q_oddly_proud': "What's something you're oddly proud of?",
  'q_didnt_make_sense': "What's something you've done that didn't make sense but felt worth it?",
  'q_two_things': "Give me 2 things about you that don't go together.",
  'q_anything_else': "Is there anything else you want us to know? Funny stories, quirks, whatever feels important and very you.",
};

// ============================================
// FIXED MESSAGES - Not AI generated
// ============================================

const MESSAGES = {
  initialWelcome: [
    "You made it to Stranger Texts!",
    "It's so cool that you're here and willing to try this. Thank you.",
    "What should we call you?",
  ],

  // Message 1: Welcome with fireworks + italic parenthetical
  howItWorksWelcome: (name: string) => `Welcome to the club, ${name} `,
  howItWorksItalic: `(imagine fireworks going off, children cheering, etc.)`,

  // Message 2: The pitch
  howItWorksPitch: `Here's the plan: We'll ask you a few questions to get to know you, set you up with your first match, and get you both talking.`,

  // Message 3: Ready check
  howItWorksReady: `You ready to start?`,

  notReady: `It's all good. Let us know if you have any questions.`,

  letsStart: [
    "Sweet. For these, the more detailed you are, the better this works. A couple sentences is great. If you're not feeling one, just say \"skip\".",
    "What's the best compliment you've ever gotten?",
  ],

  onboardingComplete: [
    "This was awesome. Thanks for sharing all that with us.",
    "We're going to go do some digging and see what match makes sense for you.",
    "We'll be back next Sunday at 9AM EST with someone we think you'll like.\n\nUntil then, peace and love.",
  ],
};

// ============================================
// PAUSED STATE FAQ RESPONSES
// ============================================

type PausedQuestion = 'whatIsThis' | 'howItWorks' | 'cost' | 'whoSees' | 'anonymous';

const PAUSED_FAQ_RESPONSES: Record<PausedQuestion, string> = {
  whatIsThis: `totally fair — this is Stranger Texts. we get to know you a bit, match you with someone, and help you start a conversation through a few prompts.

want to keep going?`,
  howItWorks: `good question — we ask you a few questions to build your profile, match you with someone we think you'll click with, then send you both the same prompts to respond to throughout the week. if you both want to connect at the end, we make it happen.

want to try it out?`,
  cost: `good question — there's a free trial, and then it's $5/month if you want to keep going. you can cancel anytime.

want to try it out?`,
  whoSees: `just us and your match. your match only sees the answers you share during prompt week — not your phone number or personal info unless you both opt in to connect.

want to continue?`,
  anonymous: `yep, it's anonymous until you both decide to connect. your match won't see your number or name unless you both say yes at the end of the week.

ready to start?`,
};

function detectPausedQuestion(message: string): PausedQuestion | null {
  const lower = message.toLowerCase().trim();

  // "what is this" / "can you tell me what this is" / "what's this about"
  if (/what('?s| is) this|tell me what this is|what('?s| is) stranger texts|what am i signing up for/i.test(lower)) {
    return 'whatIsThis';
  }

  // "how does this work" / "how does it work" / "what happens"
  if (/how does (this|it) work|what happens|then what|walk me through/i.test(lower)) {
    return 'howItWorks';
  }

  // Payment questions - HIGH PRIORITY
  // "do i have to pay" / "how much" / "cost" / "price" / "is it free" / "subscription"
  if (/\bpay\b|how much|cost|price|\$|\bfree\b|subscription|is (this|it) free|do i have to/i.test(lower)) {
    return 'cost';
  }

  // "who sees" / "who can see" / "who gets my answers"
  if (/who sees|who can see|who gets|share my answers|share with/i.test(lower)) {
    return 'whoSees';
  }

  // "anonymous" / "is this anonymous" / "is it private"
  if (/anonymous|is (this|it) private|privacy|my info/i.test(lower)) {
    return 'anonymous';
  }

  return null;
}

// ============================================
// FAQ RESPONSES (during onboarding questions)
// ============================================

const FAQ_RESPONSES: Record<string, { patterns: string[]; response: string }> = {
  whyAskingThis: {
    patterns: ['why are you asking', 'why do you need', 'why these questions'],
    response: `We want to get to know you so we can create your profile and match you with someone thoughtfully.

You never have to answer anything you don't want to. And your data is locked down just to run this experience.`,
  },
  whatWillMatchKnow: {
    patterns: ['what will my match know', 'what do they see', 'is it anonymous'],
    response: `When you're first matched, we only share a few facts about you. Your name and contact info stay anonymous.

At the end of the week, if you both opt in, then we'll share more so you can connect.`,
  },
  whoAreYou: {
    patterns: ['who are you', 'are you a bot', 'is this ai', 'are you real'],
    response: `I'm an AI assistant that helps facilitate Stranger Texts on behalf of Lady Rithika.

I help with logistical stuff like answering questions and matching people. But the creative prompts and responses come from real people.`,
  },
  whoMadeThis: {
    patterns: ['who made this', 'who created this', 'who runs this'],
    response: `A shawty named Rithika.

For context, I did not want to call her shawty. She programmed me this way.

You can learn more about her here: https://rithikaisafool.com`,
  },
  whatIsThis: {
    patterns: ['what is this', 'where am i', 'how does this work', 'what is stranger texts'],
    response: `This is Stranger Texts. Think pen pals, but through text.

Each week, we pair you with someone new to share art, stories, and moments from your lives. We'll make everything happen right here in these texts.

You can learn more here: https://rithikaisafool.com`,
  },
  howToCancel: {
    patterns: ['cancel', 'stop', 'unsubscribe', 'opt out'],
    response: `If you'd like to cancel or stop the messages, email support@rithikaisafool.com and we'll get back to you ASAP.`,
  },
  cost: {
    patterns: ['how much', 'cost', 'price', 'is it free'],
    response: `It's $5/month after the free trial. You can cancel anytime by emailing support@rithikaisafool.com.`,
  },
};

// ============================================
// INPUT CLASSIFIER - GATE BEFORE CLAUDE
// ============================================

type AnswerQuality = 'VALID' | 'UNCLEAR' | 'TOO_THIN' | 'SKIP' | 'CORRECTION' | 'QUESTION' | 'OFF_TOPIC' | 'UNCERTAIN' | 'NONSENSE';

async function classifyAnswer(question: string, input: string, previousAnswer?: string): Promise<AnswerQuality> {
  const lower = input.toLowerCase().trim();

  // Check for uncertainty/doubt first
  if (/^(idk|i don'?t know|lol idk|hmm|idrk|not sure|no idea|i have no idea|beats me)$/i.test(lower) ||
      /^(lol |haha |hmm )?(idk|i don'?t know)/i.test(lower)) {
    return 'UNCERTAIN';
  }

  // Check for correction phrases
  if (/^(i meant|i mean|actually|wait|sorry|correction|no i meant|oops)/i.test(lower) ||
      (previousAnswer && lower.length < 30 && /^(i'?m a |it'?s |that'?s |no,? )/i.test(lower))) {
    return 'CORRECTION';
  }

  // Check if it's a question
  if (lower.includes('?') || /^(what|who|how|why|where|when|is |are |do |does |can )/i.test(lower)) {
    return 'QUESTION';
  }

  // Check for nonsense/gibberish
  if (isNonsense(input)) {
    return 'NONSENSE';
  }

  // Too short = might be unclear or too thin
  if (lower.length < 3) return 'UNCLEAR';

  // Use Claude for full classification including skip detection and off-topic
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 15,
      system: `Classify this answer:
- SKIP: user wants to skip (e.g., "skip", "pass", "next", "I don't have one", "I don't like this question", "nothing comes to mind", "can't think of anything")
- VALID: clearly answers the question with enough detail
- UNCLEAR: typo, doesn't make sense, confusing (e.g., "I'm a two")
- TOO_THIN: technically answers but too brief/vague (e.g., "my job", "being nice")
- OFF_TOPIC: completely unrelated to the question, random statement, venting about something else (e.g., "do elephants poop", "I hate my job", "the weather is nice")

Return ONLY one word: SKIP, VALID, UNCLEAR, TOO_THIN, or OFF_TOPIC`,
      messages: [{
        role: 'user',
        content: `Question: "${question}"\nAnswer: "${input}"`
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim().toUpperCase() : '';
    let result: AnswerQuality = 'VALID';
    if (text.includes('SKIP')) result = 'SKIP';
    else if (text.includes('OFF_TOPIC') || text.includes('OFFTOPIC') || text.includes('OFF TOPIC')) result = 'OFF_TOPIC';
    else if (text.includes('UNCLEAR')) result = 'UNCLEAR';
    else if (text.includes('TOO_THIN') || text.includes('THIN')) result = 'TOO_THIN';

    return result;
  } catch {
    return 'VALID';
  }
}

// Clarifying responses for unclear answers (curious, not scolding)
const CLARIFY_RESPONSES: Record<string, string[]> = {
  'q_best_compliment': [
    "wait, I might be reading that wrong — what do you mean?",
    "hmm not sure I follow — what compliment?",
  ],
  'q_random_moment': [
    "wait what do you mean? tell me about a moment you think about",
    "hmm I'm confused — what's the moment?",
  ],
  'q_oddly_proud': [
    "wait, what do you mean by that?",
    "I might be missing something — what are you proud of?",
  ],
  'q_didnt_make_sense': [
    "wait, I might be reading that wrong — what do you mean?",
    "hmm not sure I follow — what's the thing you did?",
  ],
  'q_two_things': [
    "wait what? give me 2 things about you that don't go together",
    "hmm I'm confused — 2 random things about you?",
  ],
  'q_anything_else': [
    "wait what do you mean?",
  ],
};

// Follow-up responses for too-thin answers (curious, not demanding)
const FOLLOWUP_RESPONSES: Record<string, string[]> = {
  'q_best_compliment': [
    "ooh tell me more — who said it? what was the context?",
    "that's interesting — what made it stick with you?",
  ],
  'q_random_moment': [
    "wait really? tell me more about that",
    "ooh give me a little more on that",
  ],
  'q_oddly_proud': [
    "haha why though? what's the story there?",
    "wait I want to hear more — why that?",
  ],
  'q_didnt_make_sense': [
    "ooh tell me more — what happened?",
    "wait I want to hear more about that",
  ],
  'q_two_things': [
    "haha give me a little more — 2 things that don't quite go together",
    "I want 2 random things about you — things that seem like they shouldn't both be true of the same person",
  ],
  'q_anything_else': [
    "tell me more if you want, or we can wrap up",
  ],
};

// Correction acknowledgments
const CORRECTION_ACKS = [
  "ohh got it",
  "ahh okay that makes more sense",
  "ohh wait okay",
];

// Off-topic redirects (playful but brief)
const OFF_TOPIC_REDIRECTS = [
  "mm I'm pretty sure but okay, tell me",
  "haha okay but bringing it back, tell me",
  "ah that's fair but anyway, tell me",
  "lol okay noted. but tell me",
  "haha alright. anyway,",
];

// Uncertain/idk responses
const UNCERTAIN_RESPONSES = [
  "that's okay, just go with whatever comes to mind. or you can skip if you want.",
  "no pressure, whatever pops into your head. or say skip if you're not feeling it.",
  "totally fine, just say whatever. or skip it if you want.",
];

// Nonsense/gibberish responses
const NONSENSE_RESPONSES = [
  "oy! I'll take that as a warm up, want to try answering this one again..",
  "haha okay keyboard smash received. wanna give this one a real shot..",
  "lol I felt that. but for real,",
];

function getOffTopicRedirect(): string {
  return OFF_TOPIC_REDIRECTS[Math.floor(Math.random() * OFF_TOPIC_REDIRECTS.length)];
}

function getUncertainResponse(): string {
  return UNCERTAIN_RESPONSES[Math.floor(Math.random() * UNCERTAIN_RESPONSES.length)];
}

function getNonsenseResponse(): string {
  return NONSENSE_RESPONSES[Math.floor(Math.random() * NONSENSE_RESPONSES.length)];
}

// Detect keyboard smash / gibberish
function isNonsense(text: string): boolean {
  const lower = text.toLowerCase().trim();
  // Too short single "words" that aren't real
  if (lower.length < 15 && !/\s/.test(lower)) {
    // Check for keyboard smash patterns (consecutive consonants, no vowels, random chars)
    const vowelCount = (lower.match(/[aeiou]/g) || []).length;
    const consonantCount = (lower.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    // If very few vowels relative to consonants, likely gibberish
    if (consonantCount > 4 && vowelCount < consonantCount / 3) return true;
    // Common keyboard smash patterns
    if (/^[asdfghjkl]+$/i.test(lower)) return true;
    if (/^[qwerty]+$/i.test(lower)) return true;
    if (/^[zxcvbnm]+$/i.test(lower)) return true;
    // Repeated characters
    if (/(.)\1{3,}/.test(lower)) return true;
  }
  return false;
}

function getClarify(state: string): string {
  const responses = CLARIFY_RESPONSES[state] || ["wait, what do you mean?"];
  return responses[Math.floor(Math.random() * responses.length)];
}

function getFollowup(state: string): string {
  const responses = FOLLOWUP_RESPONSES[state] || ["tell me more about that"];
  return responses[Math.floor(Math.random() * responses.length)];
}

function getCorrectionAck(): string {
  return CORRECTION_ACKS[Math.floor(Math.random() * CORRECTION_ACKS.length)];
}

// Skip acknowledgments
const SKIP_ACKS = [
  "all good, we'll skip that one",
  "fair, let's move on",
  "no worries, next one",
  "totally fine, moving on",
];

function getSkipAck(): string {
  return SKIP_ACKS[Math.floor(Math.random() * SKIP_ACKS.length)];
}

// Generate a fun summary of what we learned
async function generateSummary(answers: Record<string, string>): Promise<string> {
  const validAnswers = Object.entries(answers)
    .filter(([key, val]) => val && val !== '[skipped]' && key !== 'name')
    .map(([key, val]) => `${key}: ${val}`)
    .join('\n');

  if (!validAnswers) {
    return "Here's what we learned about you: you're mysterious. We like that.";
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      system: `Summarize what we learned about this person in 2-3 short, playful sentences.
Pull out the most interesting/fun details. Be warm and casual, like you're recapping to a friend.
Start with "Here's what we learned about you:"
Don't be generic. Reference specific things they said.`,
      messages: [{
        role: 'user',
        content: validAnswers
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    return text || "Here's what we learned about you: you're pretty interesting.";
  } catch {
    return "Here's what we learned about you: you're pretty interesting.";
  }
}

// ============================================
// SYSTEM PROMPT FOR CLAUDE - REACTION ONLY
// ============================================

const REACTION_PROMPT = `Generate a short reaction (1-2 sentences) to the user's answer.

Your reaction will be followed by a fixed question from the app. Make your reaction flow naturally into it.

RULES:
- 1-2 short sentences max
- React to something SPECIFIC from their answer
- Do NOT write the next question
- Do NOT say "next question," "switching gears," "moving on," or similar
- No emojis
- No generic praise ("that's great", "love that", "interesting")
- NEVER call something "random", "weird", or "unusual" - treat unconventional answers as delightful, not odd

GOOD REACTIONS:
- "Calm is a nice one. That's not easy to do."
- "6 hours for a sandwich is kind of insane."
- "3 years is impressive. Most people kill them in weeks."
- "wait I love that"
- "that's kind of great"
- "that's actually a superpower"

BAD (generic):
- "That's really cool"
- "That says a lot about you"

BAD (labeling as odd):
- "That's such a random thing to be proud of"
- "That's a weird one but I like it"
- "That's unusual"

BAD (transition phrases):
- "Anyway, next question..."
- "Moving on..."
- "Let's switch gears..."

Return ONLY the reaction. The app will add the next question.`;

// ============================================
// HELPER FUNCTIONS
// ============================================

type ReadySentiment = 'ENTHUSIASTIC' | 'UNSURE' | 'NO';

async function classifyReadySentiment(message: string): Promise<ReadySentiment> {
  const lower = message.toLowerCase().trim();

  // Quick rule-based checks for obvious cases
  if (/^(yes|yeah|yep|yup|let'?s go|let'?s do it|i'?m ready|ready|do it|down|absolutely|definitely)$/i.test(lower)) {
    return 'ENTHUSIASTIC';
  }
  if (/^(no|nope|nah|not interested|stop)$/i.test(lower)) {
    return 'NO';
  }

  // Use Claude for ambiguous cases
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 15,
      system: `Classify this response to "You ready to start?" as:
- ENTHUSIASTIC: positive, excited, yes, let's do it
- UNSURE: hesitant, maybe, not sure, needs more info
- NO: negative, not interested, stop

Return ONLY one word: ENTHUSIASTIC, UNSURE, or NO`,
      messages: [{ role: 'user', content: message }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim().toUpperCase() : '';
    if (text.includes('ENTHUSIASTIC')) return 'ENTHUSIASTIC';
    if (text.includes('UNSURE')) return 'UNSURE';
    if (text.includes('NO')) return 'NO';
    return 'UNSURE'; // Default to unsure if unclear
  } catch {
    return 'UNSURE';
  }
}

function detectFAQ(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [key, faq] of Object.entries(FAQ_RESPONSES)) {
    if (faq.patterns.some(p => lower.includes(p))) {
      return key;
    }
  }
  return null;
}

// Check if onboarding completion messages were already sent
async function hasCompletionBeenSent(contactId: string): Promise<boolean> {
  const { data } = await supabase
    .from('messages')
    .select('id')
    .eq('contact_id', contactId)
    .eq('message_type', 'onboarding_complete')
    .limit(1);

  return !!(data && data.length > 0);
}

// Short casual responses for when they're waiting
const WAITING_RESPONSES = [
  "haha we're done for now. we'll text you sunday.",
  "you're all set! we'll be back with your match soon.",
  "nothing to do on your end. we'll handle the rest.",
  "sit tight. sunday we'll introduce you to someone.",
  "we got you. just wait for sunday.",
];

// ============================================
// MAIN HANDLER
// ============================================

interface OnboardingResult {
  success: boolean;
  newState: OnboardingState;
  error?: string;
}

export async function handleOnboardingV2(
  contact: Contact,
  incomingMessage: string,
  messageId?: string
): Promise<OnboardingResult> {
  const currentState = (contact.onboarding_step as OnboardingState) || 'initial_welcome';
  const answers = contact.onboarding_answers || {};
  const name = contact.name;

  // No automatic reactions during onboarding

  // Check for FAQ first
  const faqKey = detectFAQ(incomingMessage);
  if (faqKey && FAQ_RESPONSES[faqKey]) {
    // Answer FAQ, then redirect back to current question
    const faqResponse = FAQ_RESPONSES[faqKey].response;
    await sendMessage({ to: contact.phone, message: faqResponse });
    await logMessage(contact.id, faqResponse);

    // If we're in a question state, re-ask the question
    if (currentState.startsWith('q_')) {
      await new Promise(r => setTimeout(r, 1500));
      const question = STATE_QUESTIONS[currentState];
      const redirect = `Anyway, back to the question: ${question}`;
      await sendMessage({ to: contact.phone, message: redirect });
      await logMessage(contact.id, redirect);
    }

    return { success: true, newState: currentState };
  }

  // Handle based on current state
  let nextState: OnboardingState;
  let responseMessage: string;

  switch (currentState) {
    case 'initial_welcome':
      // This is their first message - send welcome and ask name
      for (const msg of MESSAGES.initialWelcome) {
        await sendMessage({ to: contact.phone, message: msg });
        await logMessage(contact.id, msg);
        await new Promise(r => setTimeout(r, 1200));
      }
      nextState = 'ask_name';
      break;

    case 'ask_name':
      // They gave us their name
      const newName = incomingMessage.trim();
      answers.name = newName;

      // Message 1: Welcome with italic part
      const welcomeMessage = `${MESSAGES.howItWorksWelcome(newName)}${MESSAGES.howItWorksItalic}`;
      const msg1Result = await sendMessage({
        to: contact.phone,
        message: welcomeMessage,
        screenEffect: 'fireworks',
      });
      console.log('Message 1 result:', msg1Result);
      await logMessage(contact.id, welcomeMessage);
      await new Promise(r => setTimeout(r, 1500));

      // Message 2: The pitch
      const msg2Result = await sendMessage({ to: contact.phone, message: MESSAGES.howItWorksPitch });
      console.log('Message 2 result:', msg2Result);
      await logMessage(contact.id, MESSAGES.howItWorksPitch);
      await new Promise(r => setTimeout(r, 1500));

      // Message 3: Ready check
      const msg3Result = await sendMessage({ to: contact.phone, message: MESSAGES.howItWorksReady });
      console.log('Message 3 result:', msg3Result);
      await logMessage(contact.id, MESSAGES.howItWorksReady);

      await updateContact(contact.id, newName, answers, 'explain_how_it_works');
      nextState = 'explain_how_it_works';
      break;

    case 'explain_how_it_works':
    case 'ask_start_confirmation':
      // 1. Check for FAQ questions FIRST (user intent overrides state)
      const confirmQuestion = detectPausedQuestion(incomingMessage);
      if (confirmQuestion) {
        const faqResponse = PAUSED_FAQ_RESPONSES[confirmQuestion];
        await sendMessage({ to: contact.phone, message: faqResponse });
        await logMessage(contact.id, faqResponse, 'confirmation_faq');
        return { success: true, newState: currentState };
      }

      // 2. Classify their sentiment about starting
      const readySentiment = await classifyReadySentiment(incomingMessage);

      if (readySentiment === 'ENTHUSIASTIC') {
        for (const msg of MESSAGES.letsStart) {
          await sendMessage({ to: contact.phone, message: msg });
          await logMessage(contact.id, msg);
          await new Promise(r => setTimeout(r, 1200));
        }
        nextState = 'q_best_compliment';
      } else {
        // UNSURE or NO - pause and wait
        const notReadyResponse = "no rush. just text back when you're ready to start.";
        await sendMessage({ to: contact.phone, message: notReadyResponse });
        await logMessage(contact.id, notReadyResponse);
        await updateContact(contact.id, name, answers, 'paused');
        return { success: true, newState: 'paused' };
      }
      break;

    case 'q_best_compliment':
    case 'q_random_moment':
    case 'q_oddly_proud':
    case 'q_didnt_make_sense':
    case 'q_two_things':
    case 'q_anything_else':
      const currentQ = STATE_QUESTIONS[currentState];
      const questionKey = currentState.replace('q_', '');
      const previousAnswer = answers[questionKey];

      // GATE: Classify answer quality BEFORE doing anything
      const answerQuality = await classifyAnswer(currentQ, incomingMessage, previousAnswer);

      // Handle QUESTION - answer it, re-ask current question
      if (answerQuality === 'QUESTION') {
        const faqKey = detectFAQ(incomingMessage);
        if (faqKey && FAQ_RESPONSES[faqKey]) {
          const faqResponse = FAQ_RESPONSES[faqKey].response;
          await sendMessage({ to: contact.phone, message: `${faqResponse}\n\nAnyway — ${currentQ}` });
          await logMessage(contact.id, faqResponse, 'faq_then_reask');
        } else {
          await sendMessage({ to: contact.phone, message: `haha not sure what you mean.\n\n${currentQ}` });
          await logMessage(contact.id, 'reask after confusion', 'reask');
        }
        return { success: true, newState: currentState };
      }

      // Handle UNCERTAIN (idk, not sure, etc) - encourage them gently
      if (answerQuality === 'UNCERTAIN') {
        const uncertainResp = getUncertainResponse();
        await sendMessage({ to: contact.phone, message: uncertainResp });
        await logMessage(contact.id, uncertainResp, 'uncertain_encourage');
        return { success: true, newState: currentState };
      }

      // Handle OFF_TOPIC - playful redirect back to question
      if (answerQuality === 'OFF_TOPIC') {
        const redirect = getOffTopicRedirect();
        await sendMessage({ to: contact.phone, message: `${redirect} ${currentQ.toLowerCase()}` });
        await logMessage(contact.id, redirect, 'off_topic_redirect');
        return { success: true, newState: currentState };
      }

      // Handle NONSENSE - keyboard smash, gibberish
      if (answerQuality === 'NONSENSE') {
        const nonsenseResp = getNonsenseResponse();
        await sendMessage({ to: contact.phone, message: `${nonsenseResp} ${currentQ.toLowerCase()}` });
        await logMessage(contact.id, nonsenseResp, 'nonsense_redirect');
        return { success: true, newState: currentState };
      }

      // Handle SKIP - mark skipped, advance
      if (answerQuality === 'SKIP') {
        answers[questionKey] = '[skipped]';
        nextState = STATE_FLOW[currentState] as OnboardingState;
        const nextQ = nextState.startsWith('q_') ? STATE_QUESTIONS[nextState] : null;

        if (nextState === 'onboarding_complete') {
          for (const msg of MESSAGES.onboardingComplete) {
            await sendMessage({ to: contact.phone, message: msg });
            await logMessage(contact.id, msg, 'onboarding_complete');
            await new Promise(r => setTimeout(r, 1200));
          }
          const trialEnds = new Date();
          trialEnds.setDate(trialEnds.getDate() + TRIAL_DURATION_DAYS);
          await supabase.from('contacts').update({
            name, onboarding_answers: answers, onboarding_step: 'onboarding_complete',
            status: 'trial', subscription_status: 'trial', trial_started_at: new Date().toISOString(),
            trial_ends_at: trialEnds.toISOString(), last_message_at: new Date().toISOString(),
          }).eq('id', contact.id);
          return { success: true, newState: 'onboarding_complete' };
        } else if (nextQ) {
          const skipAck = getSkipAck();
          if (nextState === 'q_anything_else') {
            await sendMessage({ to: contact.phone, message: skipAck });
            await logMessage(contact.id, skipAck, 'skip_ack');
            await new Promise(r => setTimeout(r, 1000));
            const summary = await generateSummary(answers);
            await sendMessage({ to: contact.phone, message: summary });
            await logMessage(contact.id, summary, 'summary');
            await new Promise(r => setTimeout(r, 1500));
            await sendMessage({ to: contact.phone, message: nextQ });
            await logMessage(contact.id, nextQ, 'question');
          } else {
            await sendMessage({ to: contact.phone, message: `${skipAck}\n\n${nextQ}` });
            await logMessage(contact.id, skipAck, 'skip_to_next');
          }
        }
        break;
      }

      // Handle CORRECTION - update previous answer, acknowledge, re-run
      if (answerQuality === 'CORRECTION') {
        const ack = getCorrectionAck();
        answers[questionKey] = incomingMessage; // Replace with corrected answer

        // Generate reaction to corrected answer
        nextState = STATE_FLOW[currentState] as OnboardingState;
        const nextQ = nextState.startsWith('q_') ? STATE_QUESTIONS[nextState] : null;
        const reaction = await generateReaction(currentQ, incomingMessage, nextQ);

        if (nextState === 'onboarding_complete') {
          if (reaction) {
            await sendMessage({ to: contact.phone, message: `${ack} — ${reaction}` });
            await logMessage(contact.id, reaction, 'correction_reaction');
            await new Promise(r => setTimeout(r, 1200));
          }
          for (const msg of MESSAGES.onboardingComplete) {
            await sendMessage({ to: contact.phone, message: msg });
            await logMessage(contact.id, msg, 'onboarding_complete');
            await new Promise(r => setTimeout(r, 1200));
          }
          const trialEnds = new Date();
          trialEnds.setDate(trialEnds.getDate() + TRIAL_DURATION_DAYS);
          await supabase.from('contacts').update({
            name, onboarding_answers: answers, onboarding_step: 'onboarding_complete',
            status: 'trial', subscription_status: 'trial', trial_started_at: new Date().toISOString(),
            trial_ends_at: trialEnds.toISOString(), last_message_at: new Date().toISOString(),
          }).eq('id', contact.id);
          return { success: true, newState: 'onboarding_complete' };
        } else if (nextQ) {
          if (nextState === 'q_anything_else') {
            const correctionMsg = reaction ? `${ack} — ${reaction}` : ack;
            await sendMessage({ to: contact.phone, message: correctionMsg });
            await logMessage(contact.id, correctionMsg, 'correction_ack');
            await new Promise(r => setTimeout(r, 1200));
            const summary = await generateSummary(answers);
            await sendMessage({ to: contact.phone, message: summary });
            await logMessage(contact.id, summary, 'summary');
            await new Promise(r => setTimeout(r, 1500));
            await sendMessage({ to: contact.phone, message: nextQ });
            await logMessage(contact.id, nextQ, 'question');
          } else {
            const combinedMessage = reaction
              ? `${ack} — ${reaction}\n\n${nextQ}`
              : `${ack}\n\n${nextQ}`;
            await sendMessage({ to: contact.phone, message: combinedMessage });
            await logMessage(contact.id, combinedMessage, 'correction_and_next');
          }
        }
        break;
      }

      // Handle UNCLEAR - ask to clarify, don't advance
      if (answerQuality === 'UNCLEAR') {
        const clarify = getClarify(currentState);
        await sendMessage({ to: contact.phone, message: clarify });
        await logMessage(contact.id, clarify, 'clarify');
        return { success: true, newState: currentState };
      }

      // Handle TOO_THIN - ask follow-up, don't advance yet
      if (answerQuality === 'TOO_THIN') {
        answers[questionKey] = incomingMessage; // Save draft
        const followup = getFollowup(currentState);
        await sendMessage({ to: contact.phone, message: followup });
        await logMessage(contact.id, followup, 'followup');
        return { success: true, newState: currentState };
      }

      // VALID - store answer and advance
      answers[questionKey] = incomingMessage;
      nextState = STATE_FLOW[currentState] as OnboardingState;
      const nextQ = nextState.startsWith('q_') ? STATE_QUESTIONS[nextState] : null;
      const reaction = await generateReaction(currentQ, incomingMessage, nextQ);

      if (nextState === 'onboarding_complete') {
        if (reaction) {
          await sendMessage({ to: contact.phone, message: reaction });
          await logMessage(contact.id, reaction, 'reaction');
          await new Promise(r => setTimeout(r, 1200));
        }
        for (const msg of MESSAGES.onboardingComplete) {
          await sendMessage({ to: contact.phone, message: msg });
          await logMessage(contact.id, msg, 'onboarding_complete');
          await new Promise(r => setTimeout(r, 1200));
        }
        const trialEnds = new Date();
        trialEnds.setDate(trialEnds.getDate() + TRIAL_DURATION_DAYS);
        await supabase.from('contacts').update({
          name, onboarding_answers: answers, onboarding_step: 'onboarding_complete',
          status: 'trial', subscription_status: 'trial', trial_started_at: new Date().toISOString(),
          trial_ends_at: trialEnds.toISOString(), last_message_at: new Date().toISOString(),
        }).eq('id', contact.id);
        return { success: true, newState: 'onboarding_complete' };
      } else if (nextQ) {
        // Special handling for "anything else" - send summary first
        if (nextState === 'q_anything_else') {
          // Send reaction first
          if (reaction) {
            await sendMessage({ to: contact.phone, message: reaction });
            await logMessage(contact.id, reaction, 'reaction');
            await new Promise(r => setTimeout(r, 1200));
          }
          // Generate and send summary
          const summary = await generateSummary(answers);
          await sendMessage({ to: contact.phone, message: summary });
          await logMessage(contact.id, summary, 'summary');
          await new Promise(r => setTimeout(r, 1500));
          // Send the "anything else" question
          await sendMessage({ to: contact.phone, message: nextQ });
          await logMessage(contact.id, nextQ, 'question');
        } else {
          const combinedMessage = reaction ? `${reaction}\n\n${nextQ}` : nextQ;
          await sendMessage({ to: contact.phone, message: combinedMessage });
          await logMessage(contact.id, combinedMessage, 'reaction_and_question');
        }
      }
      break;

    case 'onboarding_complete':
      // TERMINAL STATE - completion messages already sent, just respond casually
      // Fix status if needed (edge case)
      if (contact.status !== 'trial') {
        const trialEnds = new Date();
        trialEnds.setDate(trialEnds.getDate() + TRIAL_DURATION_DAYS);

        await supabase
          .from('contacts')
          .update({
            status: 'trial',
            subscription_status: 'trial',
            trial_started_at: new Date().toISOString(),
            trial_ends_at: trialEnds.toISOString(),
            last_message_at: new Date().toISOString(),
          })
          .eq('id', contact.id);
      }

      // Short casual response - don't repeat instructions or send long messages
      const waitingResponse = WAITING_RESPONSES[Math.floor(Math.random() * WAITING_RESPONSES.length)];
      await sendMessage({ to: contact.phone, message: waitingResponse });
      await logMessage(contact.id, waitingResponse, 'waiting');

      return { success: true, newState: 'onboarding_complete' };

    case 'paused':
      // 1. Check for STOP/HELP/unsubscribe commands
      const lowerPaused = incomingMessage.toLowerCase().trim();
      if (/^(stop|unsubscribe|cancel|opt out|help)$/i.test(lowerPaused)) {
        const stopResponse = "No problem. If you ever want to come back, just text us. Take care!";
        await sendMessage({ to: contact.phone, message: stopResponse });
        await logMessage(contact.id, stopResponse, 'stop_acknowledged');
        await supabase.from('contacts').update({ status: 'cancelled' }).eq('id', contact.id);
        return { success: true, newState: 'paused' };
      }

      // 2. Check for FAQ/confusion questions
      const pausedQuestion = detectPausedQuestion(incomingMessage);
      if (pausedQuestion) {
        const faqResponse = PAUSED_FAQ_RESPONSES[pausedQuestion];
        await sendMessage({ to: contact.phone, message: faqResponse });
        await logMessage(contact.id, faqResponse, 'paused_faq');
        return { success: true, newState: 'paused' };
      }

      // 3. Check readiness sentiment
      const pausedSentiment = await classifyReadySentiment(incomingMessage);

      if (pausedSentiment === 'ENTHUSIASTIC') {
        for (const msg of MESSAGES.letsStart) {
          await sendMessage({ to: contact.phone, message: msg });
          await logMessage(contact.id, msg);
          await new Promise(r => setTimeout(r, 1200));
        }
        nextState = 'q_best_compliment';
      } else {
        // Still not ready - but be more inviting
        const notReadyResponse = "no rush. just text back when you're ready to start.";
        await sendMessage({ to: contact.phone, message: notReadyResponse });
        await logMessage(contact.id, notReadyResponse);
        return { success: true, newState: 'paused' };
      }
      break;

    default:
      nextState = currentState;
  }

  // Update contact state
  await updateContact(contact.id, name, answers, nextState);
  return { success: true, newState: nextState };
}

// ============================================
// AI REACTION GENERATOR - SIMPLE
// ============================================

async function generateReaction(
  currentQuestion: string,
  userAnswer: string,
  nextQuestion: string | null
): Promise<string> {
  const prompt = nextQuestion
    ? `Question asked: "${currentQuestion}"
User answered: "${userAnswer}"
Next question (app will add this): "${nextQuestion}"

Generate a reaction that flows naturally into the next question.`
    : `Question asked: "${currentQuestion}"
User answered: "${userAnswer}"

This was the last question. Generate a warm wrap-up reaction.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 75,
      system: REACTION_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return text.trim();
  } catch (error) {
    console.error('Error generating reaction:', error);
    return ''; // No reaction on error, app will just send the question
  }
}

// ============================================
// HELPERS
// ============================================

async function logMessage(contactId: string, message: string, type: string = 'onboarding') {
  await supabase.from('messages').insert({
    contact_id: contactId,
    prompt: message,
    direction: 'outbound',
    message_type: type,
  });
}

// Save response to normalized onboarding_responses table
async function saveOnboardingResponse(
  contactId: string,
  questionKey: string,
  response: string,
  qualityScore?: number,
  skipped: boolean = false
) {
  try {
    // Check if response already exists for this question
    const { data: existing } = await supabase
      .from('onboarding_responses')
      .select('id')
      .eq('contact_id', contactId)
      .eq('question_key', questionKey)
      .single();

    if (existing) {
      // Update existing
      await supabase
        .from('onboarding_responses')
        .update({
          response: skipped ? null : response,
          quality_score: qualityScore,
          skipped,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Insert new
      await supabase.from('onboarding_responses').insert({
        contact_id: contactId,
        question_key: questionKey,
        response: skipped ? null : response,
        quality_score: qualityScore,
        skipped,
      });
    }
  } catch (error) {
    console.error('Failed to save onboarding response:', error);
  }
}

async function updateContact(
  contactId: string,
  name: string | null,
  answers: Record<string, string>,
  state: OnboardingState
) {
  await supabase
    .from('contacts')
    .update({
      name,
      onboarding_answers: answers,
      onboarding_step: state,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', contactId);
}

// ============================================
// START ONBOARDING (first contact)
// ============================================

export async function startOnboardingV2(contact: Contact, initialMessage?: string): Promise<void> {
  // Check for FAQ in initial message
  if (initialMessage) {
    const faqKey = detectFAQ(initialMessage);
    if (faqKey && FAQ_RESPONSES[faqKey]) {
      await sendMessage({ to: contact.phone, message: FAQ_RESPONSES[faqKey].response });
      await logMessage(contact.id, FAQ_RESPONSES[faqKey].response);
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Send welcome messages with delays
  for (const msg of MESSAGES.initialWelcome) {
    await sendMessage({ to: contact.phone, message: msg });
    await logMessage(contact.id, msg);
    await new Promise(r => setTimeout(r, 1200));
  }

  // Update contact
  await supabase
    .from('contacts')
    .update({
      status: 'onboarding',
      onboarding_step: 'ask_name',
      last_message_at: new Date().toISOString(),
    })
    .eq('id', contact.id);
}
