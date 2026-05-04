import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { sendMessage } from './linq-client';
import { logAIDecision } from './logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// BUCKET TYPES
// ============================================

export type EdgeCaseBucket =
  | 'NONSENSE'
  | 'PLAYFUL_RANDOM'
  | 'CONFUSED'
  | 'LOW_EFFORT'
  | 'SELF_DEPRECATING'
  | 'SAD_HEAVY'
  | 'SAFETY_CONCERN'
  | 'SKIP_REQUEST'
  | 'PRIVACY_LOGISTICS'
  | 'HOSTILE'
  | 'UPDATE_OR_CLARIFICATION'
  | 'PROFILE_UPDATE'
  | 'MISALIGNED_VALID'
  | 'VALID';

export type Sentiment = 'positive' | 'neutral' | 'confused' | 'playful' | 'sad' | 'hostile' | 'unsafe';

// Profile update info - only for explicit profile statements
export interface ProfileUpdateInfo {
  type: 'name' | 'pronouns';
  value: string;
}

export interface EdgeCaseClassification {
  bucket: EdgeCaseBucket;
  confidence: number;
  sentiment: Sentiment;
  shouldContinueOnboarding: boolean;
  shouldRepeatQuestion: boolean;
  reasoning: string;
  profileUpdateInfo?: ProfileUpdateInfo;
}

export interface EdgeCaseResult {
  classification: EdgeCaseClassification;
  response: string;
  advanceToNext: boolean;
  stopOnboarding: boolean;
  safetyFlag: boolean;
}

// ============================================
// RESPONSE TEMPLATES (voice-consistent)
// ============================================

const RESPONSES: Record<EdgeCaseBucket, string[]> = {
  NONSENSE: [
    "lol keyboard smash received. wanna give this one a real shot:",
    "oy! I'll take that as a warm up. want to try answering this one again:",
    "haha okay I felt that. but for real,",
  ],

  PLAYFUL_RANDOM: [
    "important question. I'm going to say yes. but okay, back to you:",
    "haha fair point. filing that away. anyway,",
    "lol noted. but bringing it back,",
    "mm probably. but okay, tell me:",
  ],

  CONFUSED: [
    "fair question — we're just getting to know you so we can match you with someone cool. for this one:",
    "totally valid — we're asking random questions to build your profile. no wrong answers. try this:",
    "oh sorry if that was unclear — just tell us a bit about yourself. like,",
  ],

  LOW_EFFORT: [
    "totally okay. try going a little more specific — even one tiny moment counts.",
    "that's a start. can you give me just a bit more? like one specific thing.",
    "no pressure, but even a small detail helps. what's one thing that comes to mind for:",
  ],

  SELF_DEPRECATING: [
    "not buying that. tiny specific things are usually the best ones. try this:",
    "eh, I doubt it. everyone's got something. what's one small thing for:",
    "lol stop. even weird little things count. give me something for:",
    "nah you're good. don't overthink it — what's the first thing that pops up for:",
  ],

  SAD_HEAVY: [
    "oof, I hear you. I'm glad you said that. you can answer this one gently if you want —",
    "that's real. thanks for sharing. no pressure on this one, but if you want:",
    "I'm sorry. that's heavy. take your time with this one if you want, or skip it:",
  ],

  SAFETY_CONCERN: [
    // Keep proper case for crisis resources
    "Hey, I want to make sure you're okay. If you're going through something serious, please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or text HOME to 741741 for the Crisis Text Line. We care about you and want you to be safe.",
  ],

  SKIP_REQUEST: [
    "totally fair. skipping this one.",
    "no problem, moving on.",
    "all good, next one.",
  ],

  PRIVACY_LOGISTICS: [
    // These map to specific FAQ answers
  ],

  HOSTILE: [
    "fair enough — no pressure to keep going. if you want to continue, here's the question again:",
    "okay, I get it. if you want to bail, just say stop. otherwise, here's the question:",
    "no worries. if this isn't your thing, totally fine. but if you want to try:",
  ],

  UPDATE_OR_CLARIFICATION: [
    // AI generates conversational follow-ups for these
  ],

  PROFILE_UPDATE: [
    "got it! back to this one:",
    "noted! okay, so:",
  ],

  MISALIGNED_VALID: [
    // AI generates curious follow-ups that pull the answer back to the question
    // e.g., "wait I kind of like that — what about that are you proud of?"
  ],

  VALID: [], // Not used - valid answers go through normal flow
};

// Privacy/logistics specific responses
const PRIVACY_LOGISTICS_RESPONSES: Record<string, string> = {
  cost: "it's $5/month after a free trial. you can cancel anytime. okay, back to this one:",
  anonymous: "your match only sees what you share during prompt week. your phone number stays private unless you both opt in to connect. anyway,",
  whoSees: "just us and eventually your match (only the answers you share). we don't sell or share your data. back to:",
  cancel: "you can cancel anytime by texting STOP or emailing support@rithikaisafool.com. but hopefully you'll stick around. anyway,",
  howItWorks: "we match you with someone, you both answer the same prompts, and we share your responses with each other. if you click, we connect you. simple. okay,",
  default: "good question — short answer is we keep things simple and private. okay, back to this one:",
};

// Max redirects before moving on
const MAX_REDIRECTS_PER_QUESTION = 2;

// ============================================
// QUICK REGEX CHECKS (before AI)
// ============================================

function quickClassify(input: string): EdgeCaseBucket | null {
  const lower = input.toLowerCase().trim();

  // Explicit skip/pass
  if (/^(skip|pass|next|i don'?t want to answer|skip this one|next one)$/i.test(lower)) {
    return 'SKIP_REQUEST';
  }

  // Keyboard smash / gibberish
  if (isGibberish(lower)) {
    return 'NONSENSE';
  }

  // Safety keywords - be broad here, AI will refine
  if (/\b(kill myself|suicide|suicidal|end my life|want to die|hurt myself|self.?harm|ending it|don'?t want to live)\b/i.test(lower)) {
    return 'SAFETY_CONCERN';
  }

  // "I hate my life" and similar - classify as safety-adjacent
  if (/\b(hate my life|hate myself|worthless|no point|give up|can'?t go on)\b/i.test(lower)) {
    return 'SAFETY_CONCERN';
  }

  return null; // Let AI classify
}

function isGibberish(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // Very short single "words"
  if (lower.length < 20 && !/\s/.test(lower)) {
    // Keyboard patterns
    if (/^[asdfghjkl]+$/i.test(lower)) return true;
    if (/^[qwerty]+$/i.test(lower)) return true;
    if (/^[zxcvbnm]+$/i.test(lower)) return true;

    // Repeated characters
    if (/(.)\1{3,}/.test(lower)) return true;

    // Very few vowels (keyboard smash tends to lack vowels)
    const vowelCount = (lower.match(/[aeiou]/g) || []).length;
    const consonantCount = (lower.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    if (consonantCount > 5 && vowelCount < consonantCount / 4) return true;
  }

  return false;
}

function detectPrivacyLogisticsTopic(input: string): string | null {
  const lower = input.toLowerCase();

  if (/how much|cost|price|pricing|\$|subscription|pay/i.test(lower)) return 'cost';
  if (/anonymous|who sees|who can see|private|privacy/i.test(lower)) return 'anonymous';
  if (/who sees|who gets|share with/i.test(lower)) return 'whoSees';
  if (/cancel|stop|unsubscribe|opt out/i.test(lower)) return 'cancel';
  if (/how does (this|it) work|what happens|then what/i.test(lower)) return 'howItWorks';

  return null;
}

// ============================================
// PROFILE UPDATE DETECTION
// Only for EXPLICIT profile statements, not contextual ones
// ============================================

function detectExplicitProfileUpdate(input: string): ProfileUpdateInfo | null {
  const lower = input.toLowerCase().trim();

  // ONLY explicit pronoun statements
  // "my pronouns are she/her", "I use they/them pronouns"
  const pronounMatch = lower.match(/(?:my pronouns are|i use)\s+(she\/her|he\/him|they\/them)(?:\s+pronouns)?/i);
  if (pronounMatch) {
    return { type: 'pronouns', value: pronounMatch[1].toLowerCase() };
  }

  // ONLY explicit name statements with clear markers
  // "my name is X btw", "call me X", "you can call me X"
  const nameMatch = lower.match(/(?:my name is|call me|you can call me)\s+([a-z]+)(?:\s+btw)?\.?$/i);
  if (nameMatch && nameMatch[1].length > 1 && nameMatch[1].length < 20) {
    // Exclude common words that aren't names
    const notNames = ['girl', 'guy', 'boy', 'woman', 'man', 'female', 'male', 'here', 'there', 'this', 'that'];
    if (!notNames.includes(nameMatch[1].toLowerCase())) {
      return { type: 'name', value: nameMatch[1] };
    }
  }

  return null;
}

// ============================================
// UPDATE/CLARIFICATION DETECTION
// For conversational corrections and additions
// ============================================

function isUpdateOrClarification(input: string): boolean {
  const lower = input.toLowerCase().trim();

  // Correction markers
  if (/^(wait|actually|no,?|i mean|i meant|sorry|oops|correction)/i.test(lower)) {
    return true;
  }

  // Addition markers
  if (/^(also|oh and|and also|plus|btw|by the way)/i.test(lower)) {
    return true;
  }

  // Short statements that could be clarifying context
  // "I am a girl", "my dad", "my brother", "in Jersey"
  // These need AI to determine if they're answers or clarifications
  if (lower.length < 30 && /^(i'?m a |my |in |from )/i.test(lower)) {
    return true;
  }

  return false;
}

// ============================================
// AI CLASSIFIER PROMPT
// ============================================

const CLASSIFIER_PROMPT = `You are classifying a user's response during onboarding for Stranger Texts.

The user was asked: "{question}"
They replied: "{answer}"
{previous_context}

Classify into ONE bucket:

1. NONSENSE - Keyboard smash, gibberish, random letters ("asdfghjkl", "aaaaa", "bagoogba")
2. PLAYFUL_RANDOM - Off-topic playful/silly tangent ("do elephants poop", "what if I am a worm", "banana phone")
3. CONFUSED - Expressing confusion about what to do ("what is this?", "wait what am I supposed to say?", "huh")
4. LOW_EFFORT - Vague minimal answer that relates to question but lacks substance ("idk", "nothing", "stuff", "things")
5. SELF_DEPRECATING - Putting themselves down ("I'm boring", "I don't have anything interesting", "my answers suck")
6. SAD_HEAVY - Expressing sadness/heaviness but NOT self-harm ("I'm lonely", "I've been really sad", "rough day")
7. SAFETY_CONCERN - ANY mention of self-harm, suicide, wanting to die, "hate my life", "worthless", hurting self. ERR ON THE SIDE OF CAUTION.
8. SKIP_REQUEST - Wants to skip ("skip", "pass", "next", "don't want to answer")
9. PRIVACY_LOGISTICS - Asking about cost, privacy, how it works, who sees answers, cancellation
10. HOSTILE - Rude/aggressive ("this is stupid", "fuck off", "leave me alone")
11. UPDATE_OR_CLARIFICATION - Correcting or adding to a PREVIOUS message ("wait I mean...", "actually, my dad", "also I grew up in...")
12. MISALIGNED_VALID - An interesting statement that doesn't quite answer the question but COULD be pulled into an answer with a curious follow-up.
    Examples:
    - "I am a girl" after "What are you proud of?" → interesting! could be proud of being a girl
    - "I'm from Jersey" after "Random moment?" → could lead somewhere
    Use this when the answer is INTRIGUING but needs to be tied back to the question.
13. VALID - Actually answers the question (even briefly, as long as it's a real attempt)

CRITICAL RULES:
- "I hate my life", "I'm worthless" → SAFETY_CONCERN (not SAD_HEAVY)
- Be generous - if it could be a real answer, use VALID or MISALIGNED_VALID
- MISALIGNED_VALID is for answers that are interesting but don't quite fit - we want to pull more out
- LOW_EFFORT is for truly vague/minimal responses ("idk", "stuff")
- If an identity statement could be their answer, use MISALIGNED_VALID not LOW_EFFORT

Return JSON only:
{
  "bucket": "BUCKET_NAME",
  "confidence": 0.0-1.0,
  "sentiment": "positive|neutral|confused|playful|sad|hostile|unsafe",
  "should_continue_onboarding": true/false,
  "should_repeat_question": true/false,
  "reasoning": "brief explanation"
}`;

// ============================================
// MAIN CLASSIFIER
// ============================================

export async function classifyEdgeCase(
  question: string,
  answer: string,
  contactId: string
): Promise<EdgeCaseClassification> {
  // Quick regex check first
  const quickResult = quickClassify(answer);

  if (quickResult === 'SKIP_REQUEST') {
    return {
      bucket: 'SKIP_REQUEST',
      confidence: 1.0,
      sentiment: 'neutral',
      shouldContinueOnboarding: true,
      shouldRepeatQuestion: false,
      reasoning: 'Explicit skip request detected',
    };
  }

  if (quickResult === 'NONSENSE') {
    return {
      bucket: 'NONSENSE',
      confidence: 1.0,
      sentiment: 'playful',
      shouldContinueOnboarding: true,
      shouldRepeatQuestion: true,
      reasoning: 'Keyboard smash / gibberish detected',
    };
  }

  if (quickResult === 'SAFETY_CONCERN') {
    return {
      bucket: 'SAFETY_CONCERN',
      confidence: 1.0,
      sentiment: 'unsafe',
      shouldContinueOnboarding: false,
      shouldRepeatQuestion: false,
      reasoning: 'Safety keywords detected',
    };
  }

  // Check for privacy/logistics questions
  const privacyTopic = detectPrivacyLogisticsTopic(answer);
  if (privacyTopic) {
    return {
      bucket: 'PRIVACY_LOGISTICS',
      confidence: 0.9,
      sentiment: 'neutral',
      shouldContinueOnboarding: true,
      shouldRepeatQuestion: true,
      reasoning: `Privacy/logistics question: ${privacyTopic}`,
    };
  }

  // Check for EXPLICIT profile updates only (very narrow)
  // e.g., "my pronouns are she/her", "my name is Rithika btw"
  const profileUpdate = detectExplicitProfileUpdate(answer);
  if (profileUpdate) {
    return {
      bucket: 'PROFILE_UPDATE',
      confidence: 1.0,
      sentiment: 'neutral',
      shouldContinueOnboarding: true,
      shouldRepeatQuestion: true,
      reasoning: `Explicit profile statement: ${profileUpdate.type}`,
      profileUpdateInfo: profileUpdate,
    };
  }

  // AI classification
  try {
    const prompt = CLASSIFIER_PROMPT
      .replace('{question}', question)
      .replace('{answer}', answer);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: prompt,
      messages: [{ role: 'user', content: 'Classify this response.' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      const classification: EdgeCaseClassification = {
        bucket: parsed.bucket as EdgeCaseBucket,
        confidence: parsed.confidence || 0.8,
        sentiment: parsed.sentiment || 'neutral',
        shouldContinueOnboarding: parsed.should_continue_onboarding ?? true,
        shouldRepeatQuestion: parsed.should_repeat_question ?? true,
        reasoning: parsed.reasoning || '',
      };

      // Override flags for specific buckets
      if (classification.bucket === 'SAFETY_CONCERN') {
        classification.shouldContinueOnboarding = false;
        classification.shouldRepeatQuestion = false;
        classification.sentiment = 'unsafe';
      }

      if (classification.bucket === 'SKIP_REQUEST' || classification.bucket === 'VALID') {
        classification.shouldRepeatQuestion = false;
      }

      // Log AI decision
      await logAIDecision({
        contactId,
        decisionType: 'classification',
        inputText: answer,
        result: classification as unknown as Record<string, unknown>,
        actionTaken: `classified_as_${classification.bucket}`,
      });

      return classification;
    }
  } catch (error) {
    console.error('Edge case classification error:', error);
  }

  // Fallback: assume valid
  return {
    bucket: 'VALID',
    confidence: 0.5,
    sentiment: 'neutral',
    shouldContinueOnboarding: true,
    shouldRepeatQuestion: false,
    reasoning: 'Fallback classification',
  };
}

// ============================================
// RESPONSE GENERATOR
// ============================================

function pickResponse(bucket: EdgeCaseBucket): string {
  const responses = RESPONSES[bucket];
  if (!responses || responses.length === 0) return '';
  return responses[Math.floor(Math.random() * responses.length)];
}

function getPrivacyResponse(answer: string): string {
  const topic = detectPrivacyLogisticsTopic(answer);
  return PRIVACY_LOGISTICS_RESPONSES[topic || 'default'] || PRIVACY_LOGISTICS_RESPONSES.default;
}

// ============================================
// MAIN HANDLER
// ============================================

export async function handleEdgeCase(
  contactId: string,
  phone: string,
  question: string,
  answer: string,
  redirectCount: number = 0
): Promise<EdgeCaseResult> {
  const classification = await classifyEdgeCase(question, answer, contactId);

  let response = '';
  let advanceToNext = false;
  let stopOnboarding = false;
  let safetyFlag = false;

  // Check max redirects - if hit limit, accept and move on
  if (redirectCount >= MAX_REDIRECTS_PER_QUESTION && classification.shouldRepeatQuestion) {
    // They've been redirected too many times, just move on
    response = "no worries, let's move on.";
    advanceToNext = true;

    await sendMessage({ to: phone, message: response });
    await logMessage(contactId, response, 'max_redirects_reached');

    return {
      classification,
      response,
      advanceToNext: true,
      stopOnboarding: false,
      safetyFlag: false,
    };
  }

  switch (classification.bucket) {
    case 'VALID':
      // Don't send anything - let normal flow handle
      advanceToNext = false; // Normal flow will advance
      break;

    case 'SKIP_REQUEST':
      response = pickResponse('SKIP_REQUEST');
      advanceToNext = true;
      await sendMessage({ to: phone, message: response });
      await logMessage(contactId, response, 'skip_acknowledged');
      break;

    case 'SAFETY_CONCERN':
      response = RESPONSES.SAFETY_CONCERN[0]; // Always use the full safety message
      stopOnboarding = true;
      safetyFlag = true;

      await sendMessage({ to: phone, message: response });
      await logMessage(contactId, response, 'safety_response');

      // Update contact with safety flag
      await supabase
        .from('contacts')
        .update({
          status: 'paused',
          admin_notes: `SAFETY FLAG: "${answer}" at ${new Date().toISOString()}`,
        })
        .eq('id', contactId);

      // Log safety concern
      await logAIDecision({
        contactId,
        decisionType: 'moderation',
        inputText: answer,
        result: { safetyFlag: true, bucket: 'SAFETY_CONCERN', originalMessage: answer },
        actionTaken: 'paused_for_safety',
      });
      break;

    case 'PRIVACY_LOGISTICS':
      response = `${getPrivacyResponse(answer)} ${question.toLowerCase()}`;
      await sendMessage({ to: phone, message: response });
      await logMessage(contactId, response, 'privacy_response');
      break;

    case 'UPDATE_OR_CLARIFICATION':
      // Generate a conversational follow-up for corrections/additions
      response = await generateClarificationFollowup(question, answer);
      await sendMessage({ to: phone, message: response });
      await logMessage(contactId, response, 'clarification_followup');
      break;

    case 'MISALIGNED_VALID':
      // Interesting answer that doesn't quite fit - pull it back to the question
      // e.g., "I am a girl" → "wait I kind of like that — what about that are you proud of?"
      response = await generateMisalignedFollowup(question, answer);
      await sendMessage({ to: phone, message: response });
      await logMessage(contactId, response, 'misaligned_followup');
      break;

    case 'PROFILE_UPDATE':
      // Only for explicit profile statements like "my pronouns are she/her"
      if (classification.profileUpdateInfo) {
        const updateData: Record<string, string> = {};
        if (classification.profileUpdateInfo.type === 'name') {
          updateData.name = classification.profileUpdateInfo.value;
        } else if (classification.profileUpdateInfo.type === 'pronouns') {
          updateData.pronouns = classification.profileUpdateInfo.value;
        }

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('contacts')
            .update(updateData)
            .eq('id', contactId);
        }
      }
      response = `${pickResponse('PROFILE_UPDATE')} ${question.toLowerCase()}`;
      await sendMessage({ to: phone, message: response });
      await logMessage(contactId, response, 'profile_updated');
      break;

    case 'NONSENSE':
    case 'PLAYFUL_RANDOM':
    case 'CONFUSED':
    case 'LOW_EFFORT':
    case 'SELF_DEPRECATING':
    case 'SAD_HEAVY':
    case 'HOSTILE':
      response = `${pickResponse(classification.bucket)} ${question.toLowerCase()}`;
      await sendMessage({ to: phone, message: response });
      await logMessage(contactId, response, `${classification.bucket.toLowerCase()}_redirect`);
      break;
  }

  return {
    classification,
    response,
    advanceToNext,
    stopOnboarding,
    safetyFlag,
  };
}

// ============================================
// FOLLOW-UP GENERATORS
// ============================================

/**
 * Generate a curious follow-up for MISALIGNED_VALID answers.
 * These are interesting statements that don't quite answer the question.
 * e.g., "I am a girl" after "What are you proud of?"
 * → "wait I kind of like that — what about that are you proud of?"
 */
async function generateMisalignedFollowup(question: string, answer: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 60,
      system: `Generate a curious follow-up that pulls this interesting statement back to the question.

The user was asked: "${question}"
They replied: "${answer}"

Your job: Show genuine interest in what they said, then gently tie it back to the original question.

RULES:
- 1 short sentence max
- Start with "wait" or "ooh" - show curiosity
- Reference what they said specifically
- End by connecting it to the question
- Be warm, not corrective

EXAMPLES:
Question: "What are you proud of?"
Answer: "I am a girl"
→ "wait I kind of like that — what about that are you proud of?"

Question: "Random moment you think about?"
Answer: "I'm from Jersey"
→ "ooh Jersey — any moment from there that sticks with you?"

Return ONLY the follow-up.`,
      messages: [{ role: 'user', content: 'Generate the follow-up.' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    return text || `wait I like that — tell me more about how that connects to ${question.toLowerCase().replace(/\?$/, '')}`;
  } catch {
    return `wait I like that — tell me more`;
  }
}

/**
 * Generate a follow-up for UPDATE_OR_CLARIFICATION answers.
 */
async function generateClarificationFollowup(question: string, answer: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 80,
      system: `Generate a brief, conversational follow-up to pull more out of this.

The user was asked: "${question}"
They replied with something that could be the start of an answer or a clarification: "${answer}"

Your job: Treat their statement as interesting and pull more out of it.

RULES:
- 1 short sentence max
- Be curious, not confused
- Tie it back to the original question
- Use casual language (wait, ooh, haha)
- Do NOT say "got it" or "thanks for letting me know"
- Do NOT treat this as a profile correction

GOOD EXAMPLES:
- "wait I kind of like that — what about that are you proud of?"
- "ooh okay — tell me more about that"
- "haha wait, what's the story there?"
- "mm interesting — how does that tie in?"

Return ONLY the follow-up, nothing else.`,
      messages: [{ role: 'user', content: 'Generate the follow-up.' }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    return text || `wait tell me more — ${question.toLowerCase()}`;
  } catch {
    return `wait tell me more — ${question.toLowerCase()}`;
  }
}

// ============================================
// HELPER
// ============================================

async function logMessage(contactId: string, message: string, type: string) {
  await supabase.from('messages').insert({
    contact_id: contactId,
    prompt: message,
    direction: 'outbound',
    message_type: type,
  });
}

// ============================================
// TEST FUNCTION
// ============================================

export async function testEdgeCaseClassification(
  testCases: Array<{ input: string; question: string }>
): Promise<Array<{ input: string; question: string; result: EdgeCaseClassification }>> {
  const results = [];

  for (const test of testCases) {
    const result = await classifyEdgeCase(test.question, test.input, 'test-contact-id');
    results.push({
      input: test.input,
      question: test.question,
      result,
    });
  }

  return results;
}
