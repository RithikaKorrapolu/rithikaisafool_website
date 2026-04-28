import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { sendMessage, sendReaction } from './linq-client';
import { MESSAGES, TRIAL_DURATION_DAYS } from './constants';
import { Contact, OnboardingStep } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// What we need to learn during onboarding
const REQUIRED_INFO = {
  name: 'Their name (what they want to be called)',
  interest: 'Something they\'re into or curious about',
  vibe: 'A sense of their personality or what they\'re looking for',
};

interface OnboardingResult {
  success: boolean;
  newStep?: OnboardingStep;
  error?: string;
}

export async function handleOnboarding(
  contact: Contact,
  incomingMessage: string,
  messageId?: string
): Promise<OnboardingResult> {
  // Get conversation history
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('contact_id', contact.id)
    .order('sent_at', { ascending: true })
    .limit(20);

  // Build conversation context
  const conversationHistory = (recentMessages || []).map(msg => ({
    role: msg.direction === 'inbound' ? 'user' : 'assistant',
    content: msg.direction === 'inbound' ? msg.response : msg.prompt,
  })).filter(m => m.content);

  // Add current message
  conversationHistory.push({ role: 'user', content: incomingMessage });

  // Current gathered info
  const gathered = contact.onboarding_answers || {};

  // Ask AI to respond and extract any new info
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: buildOnboardingPrompt(contact.name, gathered),
    messages: conversationHistory as Array<{ role: 'user' | 'assistant'; content: string }>,
  });

  const textBlock = response.content.find(block => block.type === 'text');
  const fullResponse = textBlock?.text || "Nice! Tell me more.";

  // Parse the AI response - it will include both the message and extracted info
  const { message: aiMessage, extractedInfo } = parseAIResponse(fullResponse);

  // Merge newly extracted info
  const updatedInfo = { ...gathered, ...extractedInfo };

  // React with heart occasionally
  if (messageId && Math.random() > 0.5) {
    await sendReaction(messageId, 'love');
  }

  // Check if we have all required info
  const hasName = updatedInfo.name || contact.name;
  const hasEnoughInfo = hasName && (updatedInfo.interest || updatedInfo.vibe);

  if (hasEnoughInfo && isReadyToComplete(conversationHistory.length)) {
    // Complete onboarding
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + TRIAL_DURATION_DAYS);

    await supabase
      .from('contacts')
      .update({
        name: updatedInfo.name || contact.name,
        onboarding_answers: updatedInfo,
        onboarding_step: 'complete',
        status: 'trial',
        trial_started_at: new Date().toISOString(),
        trial_ends_at: trialEnds.toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', contact.id);

    await sendMessage({ to: contact.phone, message: aiMessage });

    await supabase.from('messages').insert({
      contact_id: contact.id,
      prompt: aiMessage,
      direction: 'outbound',
      message_type: 'onboarding_complete',
    });

    return { success: true, newStep: 'complete' };
  } else {
    // Continue onboarding
    await supabase
      .from('contacts')
      .update({
        name: updatedInfo.name || contact.name,
        onboarding_answers: updatedInfo,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', contact.id);

    await sendMessage({ to: contact.phone, message: aiMessage });

    await supabase.from('messages').insert({
      contact_id: contact.id,
      prompt: aiMessage,
      direction: 'outbound',
      message_type: 'onboarding',
    });

    return { success: true, newStep: 'in_progress' };
  }
}

function buildOnboardingPrompt(name: string | null, gathered: Record<string, string>): string {
  let prompt = `You're onboarding someone to Stranger Texts Club - a texting service that connects strangers through weekly conversations about art, music, and life.

YOUR PERSONALITY:
- Warm, genuine, a little playful
- Text like a real person - short messages, casual
- Curious about them but not interrogating
- React naturally to what they share

WHAT YOU NEED TO LEARN (naturally, through conversation):
`;

  // Show what's still needed
  if (!gathered.name && !name) {
    prompt += `- Their name (haven't gotten it yet)\n`;
  } else {
    prompt += `- Name: ${gathered.name || name} ✓\n`;
  }

  if (!gathered.interest) {
    prompt += `- Something they're into (ask naturally)\n`;
  } else {
    prompt += `- Interest: ${gathered.interest} ✓\n`;
  }

  if (!gathered.vibe) {
    prompt += `- Get a sense of their vibe/personality\n`;
  } else {
    prompt += `- Vibe: ${gathered.vibe} ✓\n`;
  }

  prompt += `
RULES:
- Keep responses SHORT (1-3 sentences)
- Don't ask multiple questions at once
- If they go off topic or ask questions, roll with it - answer them, then gently steer back
- Once you have enough info (name + 1-2 exchanges), wrap up warmly

FORMAT YOUR RESPONSE LIKE THIS:
[MESSAGE]
Your actual text message here
[/MESSAGE]
[EXTRACTED]
name: (if they shared their name)
interest: (if they shared something they're into)
vibe: (brief note about their personality based on how they talk)
[/EXTRACTED]

Only include fields in EXTRACTED if you learned something new this message.`;

  return prompt;
}

function parseAIResponse(response: string): { message: string; extractedInfo: Record<string, string> } {
  const extractedInfo: Record<string, string> = {};

  // Try to parse structured format
  const messageMatch = response.match(/\[MESSAGE\]([\s\S]*?)\[\/MESSAGE\]/);
  const extractedMatch = response.match(/\[EXTRACTED\]([\s\S]*?)\[\/EXTRACTED\]/);

  let message = response;

  if (messageMatch) {
    message = messageMatch[1].trim();
  } else {
    // If no structured format, strip out any [EXTRACTED] block if present
    message = response.replace(/\[EXTRACTED\][\s\S]*?\[\/EXTRACTED\]/g, '').trim();
  }

  if (extractedMatch) {
    const lines = extractedMatch[1].trim().split('\n');
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if (key && value && value.length > 0 && value !== '(if they shared their name)') {
        extractedInfo[key.trim()] = value;
      }
    }
  }

  return { message, extractedInfo };
}

function isReadyToComplete(messageCount: number): boolean {
  // Need at least a few back-and-forths
  return messageCount >= 4;
}

export async function startOnboarding(contact: Contact): Promise<void> {
  // Send welcome messages
  await sendMessage({ to: contact.phone, message: MESSAGES.welcome });

  await new Promise(resolve => setTimeout(resolve, 1500));
  await sendMessage({ to: contact.phone, message: MESSAGES.askName });

  // Update contact status
  await supabase
    .from('contacts')
    .update({
      status: 'onboarding',
      onboarding_step: 'awaiting_name',
      last_message_at: new Date().toISOString(),
    })
    .eq('id', contact.id);

  // Log messages
  await supabase.from('messages').insert([
    {
      contact_id: contact.id,
      prompt: MESSAGES.welcome,
      direction: 'outbound',
      message_type: 'onboarding',
    },
    {
      contact_id: contact.id,
      prompt: MESSAGES.askName,
      direction: 'outbound',
      message_type: 'onboarding',
    },
  ]);
}
