import { supabase } from '@/lib/supabase';
import { Contact } from './types';

// Delay before processing partial/correction messages (in milliseconds)
export const MESSAGE_DELAY_MS = 15000; // 15 seconds

// Patterns that suggest the user is still typing / correcting
const PARTIAL_CORRECTION_PATTERNS = [
  /^wait/i,
  /^actually/i,
  /^i mean/i,
  /^also/i,
  /^sorry/i,
  /^no,?\s*(i meant|wait|actually)/i,
  /^oops/i,
  /^oh and/i,
  /^and also/i,
  /^plus/i,
  /^btw/i,
  /^correction/i,
];

/**
 * Check if a message looks like a partial thought or correction
 * that should wait for more input.
 */
export function looksLikePartialOrCorrection(message: string): boolean {
  const trimmed = message.trim();
  return PARTIAL_CORRECTION_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Store a pending message for later processing.
 * Only used for messages that look like partials/corrections.
 */
export async function storePendingMessage(
  contactId: string,
  phone: string,
  message: string
): Promise<void> {
  const now = new Date();

  // Store the message as pending
  await supabase.from('pending_onboarding_messages').insert({
    contact_id: contactId,
    phone,
    message,
    received_at: now.toISOString(),
  });

  // Update the contact's pending_response_since
  // We set this to the current time so the 60s timer resets with each new message
  await supabase
    .from('contacts')
    .update({
      pending_response_since: now.toISOString(),
      last_message_at: now.toISOString(),
    })
    .eq('id', contactId);
}

/**
 * Check if a contact has a pending message that's ready to be processed.
 * Returns true if there's a message older than 60 seconds.
 */
export async function hasPendingMessageReady(contact: Contact): Promise<boolean> {
  if (!contact.pending_response_since) return false;

  const pendingSince = new Date(contact.pending_response_since);
  const now = new Date();
  const elapsed = now.getTime() - pendingSince.getTime();

  return elapsed >= MESSAGE_DELAY_MS;
}

/**
 * Get all pending messages for a contact and combine them into one.
 * Returns the combined message and clears pending state.
 */
export async function getAndClearPendingMessages(contactId: string): Promise<string | null> {
  // Get all pending messages in order
  const { data: messages } = await supabase
    .from('pending_onboarding_messages')
    .select('message, received_at')
    .eq('contact_id', contactId)
    .order('received_at', { ascending: true });

  if (!messages || messages.length === 0) {
    return null;
  }

  // Combine messages intelligently
  const combinedMessage = combineMessages(messages.map(m => m.message));

  // Delete pending messages
  await supabase
    .from('pending_onboarding_messages')
    .delete()
    .eq('contact_id', contactId);

  // Clear pending state on contact
  await supabase
    .from('contacts')
    .update({ pending_response_since: null })
    .eq('id', contactId);

  return combinedMessage;
}

/**
 * Combine multiple messages into one coherent response.
 * Handles corrections, additions, and partial thoughts.
 */
function combineMessages(messages: string[]): string {
  if (messages.length === 1) {
    return messages[0];
  }

  // Check if the later messages are corrections
  const lastMessage = messages[messages.length - 1].toLowerCase().trim();

  // If the last message looks like a complete replacement/correction, use it primarily
  const isCorrectionMarker = /^(actually|wait|no|i meant|i mean|sorry|correction)/i.test(lastMessage);

  if (isCorrectionMarker) {
    // The last message is a correction - use it as the primary answer
    // Include earlier context only if it adds value
    return messages[messages.length - 1];
  }

  // Check if messages are building on each other (additions)
  // If they're short additions, combine them
  const allShort = messages.every(m => m.length < 100);

  if (allShort) {
    // Short messages - likely building one thought, join with space
    return messages.join(' ');
  }

  // If the last message is significantly longer, it might be a replacement
  const lastLength = messages[messages.length - 1].length;
  const previousLengths = messages.slice(0, -1).reduce((sum, m) => sum + m.length, 0);

  if (lastLength > previousLengths * 1.5) {
    // Last message is much longer - probably a more complete answer
    return messages[messages.length - 1];
  }

  // Default: join all messages with newlines (preserving the full context)
  return messages.join('\n');
}

/**
 * Get contacts with pending messages ready to process (> 60 seconds old).
 */
export async function getContactsWithReadyPendingMessages(): Promise<Contact[]> {
  const cutoffTime = new Date(Date.now() - MESSAGE_DELAY_MS).toISOString();

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .not('pending_response_since', 'is', null)
    .lt('pending_response_since', cutoffTime)
    .eq('status', 'onboarding');

  return (contacts || []) as Contact[];
}

/**
 * Check if a contact is currently waiting for message aggregation.
 */
export function isWaitingForMoreMessages(contact: Contact): boolean {
  if (!contact.pending_response_since) return false;

  const pendingSince = new Date(contact.pending_response_since);
  const now = new Date();
  const elapsed = now.getTime() - pendingSince.getTime();

  // Still waiting if less than 60 seconds have passed
  return elapsed < MESSAGE_DELAY_MS;
}
