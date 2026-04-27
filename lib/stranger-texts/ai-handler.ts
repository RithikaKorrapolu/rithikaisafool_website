import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';
import { sendMessage, sendReaction } from './linq-client';
import { AI_SYSTEM_PROMPT } from './constants';
import { Contact, Message } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateNameReaction(name: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 50,
    system: `You react to someone's name in a single short sentence. Be warm but not over the top. Examples:
- "Love that name."
- "Classic. I dig it."
- "Nice, strong name."
Just the reaction, nothing else.`,
    messages: [
      { role: 'user', content: `React to this name: ${name}` }
    ],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock?.text || "Love it.";
}

export async function handleAIConversation(
  contact: Contact,
  message: string,
  messageId?: string
): Promise<void> {
  // Get recent conversation history
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('contact_id', contact.id)
    .order('sent_at', { ascending: false })
    .limit(10);

  // Build conversation history for Claude
  const conversationHistory = buildConversationHistory(recentMessages || [], message);

  // Generate response
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: buildSystemPrompt(contact),
    messages: conversationHistory,
  });

  const textBlock = response.content.find(block => block.type === 'text');
  const aiResponse = textBlock?.text || "That's interesting!";

  // React to their message sometimes
  if (messageId && shouldReact(message)) {
    await sendReaction(messageId, '❤️');
  }

  // Send the response
  await sendMessage({ to: contact.phone, message: aiResponse });

  // Log the response
  await supabase.from('messages').insert({
    contact_id: contact.id,
    prompt: aiResponse,
    direction: 'outbound',
    message_type: 'ai_conversation',
  });
}

function buildSystemPrompt(contact: Contact): string {
  let prompt = AI_SYSTEM_PROMPT;

  if (contact.name) {
    prompt += `\n\nYou're talking to ${contact.name}.`;
  }

  if (contact.onboarding_answers && Object.keys(contact.onboarding_answers).length > 0) {
    prompt += `\n\nWhat you know about them:`;
    const answers = contact.onboarding_answers;
    if (answers.q1) prompt += `\n- They're into: ${answers.q1}`;
    if (answers.q2) prompt += `\n- Dream dinner guest: ${answers.q2}`;
    if (answers.q3) prompt += `\n- Feel-good song: ${answers.q3}`;
  }

  return prompt;
}

function buildConversationHistory(
  messages: Message[],
  currentMessage: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Add recent messages in chronological order (reverse since they come newest first)
  const chronological = [...messages].reverse();

  for (const msg of chronological) {
    if (msg.direction === 'inbound' && msg.response) {
      history.push({ role: 'user', content: msg.response });
    } else if (msg.direction === 'outbound' && msg.prompt) {
      history.push({ role: 'assistant', content: msg.prompt });
    }
  }

  // Add current message
  history.push({ role: 'user', content: currentMessage });

  return history;
}

function shouldReact(message: string): boolean {
  // React to messages that share something personal or exciting
  const excitingPatterns = [
    /!$/,
    /love/i,
    /amazing/i,
    /excited/i,
    /happy/i,
    /great/i,
    /awesome/i,
  ];

  return excitingPatterns.some(pattern => pattern.test(message));
}

export async function generatePromptResponse(
  contact: Contact,
  prompt: string,
  theirResponse: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    system: `${AI_SYSTEM_PROMPT}

The user just answered a prompt about: ${prompt}
Give a brief, warm reaction and maybe a follow-up question to keep the conversation going.`,
    messages: [
      { role: 'user', content: theirResponse }
    ],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock?.text || "That's really cool, thanks for sharing!";
}
