import { supabase } from '@/lib/supabase';
import { sendMessageSafe } from './linq-client';
import { fullModerationCheck } from './moderation';
import { handleAIConversation } from './ai-handler';
import { Contact } from './types';
import { PAIRING_PROMPTS } from './constants';

// ============================================
// TYPES
// ============================================

interface Pairing {
  id: string;
  contact_a_id: string;
  contact_b_id: string;
  week_start: string;
  status: string;
  contact_a_consent: boolean | null;
  contact_b_consent: boolean | null;
  created_at: string;
  ended_at: string | null;
}

interface PairingPrompt {
  id: string;
  pairing_id: string;
  prompt_index: number;
  prompt_text: string;
  sent_at: string | null;
  created_at: string;
}

interface PromptResponse {
  id: string;
  pairing_prompt_id: string;
  contact_id: string;
  response: string;
  quality_score: number | null;
  moderation_passed: boolean;
  shared_at: string | null;
  created_at: string;
}

interface RouteResult {
  success: boolean;
  action: string;
  error?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getMondayOfWeek(date: Date = new Date()): string {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

async function getContact(contactId: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single();

  if (error || !data) return null;
  return data as Contact;
}

async function findContactByPhone(phone: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error || !data) return null;
  return data as Contact;
}

async function getCurrentPairing(contact: Contact): Promise<Pairing | null> {
  if (!contact.current_pairing_id) return null;

  const { data, error } = await supabase
    .from('pairings')
    .select('*')
    .eq('id', contact.current_pairing_id)
    .single();

  if (error || !data) return null;
  return data as Pairing;
}

async function getPartnerContact(pairing: Pairing, contact: Contact): Promise<Contact | null> {
  const partnerId = pairing.contact_a_id === contact.id
    ? pairing.contact_b_id
    : pairing.contact_a_id;

  return getContact(partnerId);
}

// ============================================
// CREATE TRIAL PAIRING (Always with Rithika)
// ============================================

export async function createTrialPairing(contact: Contact): Promise<Pairing | null> {
  const rithikaPhone = process.env.RITHIKA_PHONE;
  if (!rithikaPhone) {
    console.error('RITHIKA_PHONE env var not set');
    return null;
  }

  // Find or create Rithika's contact record
  let rithikaContact = await findContactByPhone(rithikaPhone);
  if (!rithikaContact) {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        phone: rithikaPhone,
        name: 'Rithika',
        status: 'active',
        subscription_status: 'active',
        source: 'system',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to create Rithika contact:', error);
      return null;
    }
    rithikaContact = data as Contact;
  }

  // Create pairing
  const { data: pairing, error: pairingError } = await supabase
    .from('pairings')
    .insert({
      contact_a_id: contact.id,
      contact_b_id: rithikaContact.id,
      week_start: getMondayOfWeek(),
      status: 'active',
    })
    .select()
    .single();

  if (pairingError || !pairing) {
    console.error('Failed to create pairing:', pairingError);
    return null;
  }

  // Update contact's current_pairing_id
  await supabase
    .from('contacts')
    .update({ current_pairing_id: pairing.id })
    .eq('id', contact.id);

  // Assign 3 prompts randomly from the pool
  await assignPromptsToPariring(pairing.id);

  return pairing as Pairing;
}

// ============================================
// ASSIGN PROMPTS TO PAIRING
// ============================================

async function assignPromptsToPariring(pairingId: string): Promise<void> {
  // Shuffle and pick 3 prompts
  const shuffled = [...PAIRING_PROMPTS].sort(() => Math.random() - 0.5);
  const selectedPrompts = shuffled.slice(0, 3);

  // Insert prompts
  const promptInserts = selectedPrompts.map((prompt, index) => ({
    pairing_id: pairingId,
    prompt_index: index + 1,
    prompt_text: prompt,
  }));

  await supabase.from('pairing_prompts').insert(promptInserts);
}

// ============================================
// GET CURRENT PROMPT FOR CONTACT
// ============================================

async function getCurrentPromptForContact(
  pairing: Pairing,
  contact: Contact
): Promise<PairingPrompt | null> {
  // Get all prompts for this pairing that have been sent
  const { data: prompts, error } = await supabase
    .from('pairing_prompts')
    .select('*')
    .eq('pairing_id', pairing.id)
    .not('sent_at', 'is', null)
    .order('prompt_index', { ascending: true });

  if (error || !prompts || prompts.length === 0) return null;

  // Find the first prompt that this contact hasn't responded to
  for (const prompt of prompts) {
    const { data: response } = await supabase
      .from('prompt_responses')
      .select('id')
      .eq('pairing_prompt_id', prompt.id)
      .eq('contact_id', contact.id)
      .single();

    if (!response) {
      // This contact hasn't responded to this prompt yet
      return prompt as PairingPrompt;
    }
  }

  // All prompts responded to
  return null;
}

// ============================================
// STORE PROMPT RESPONSE
// ============================================

async function storePromptResponse(
  promptId: string,
  contactId: string,
  response: string,
  qualityScore?: number,
  moderationPassed: boolean = true
): Promise<void> {
  // Check if response already exists
  const { data: existing } = await supabase
    .from('prompt_responses')
    .select('id')
    .eq('pairing_prompt_id', promptId)
    .eq('contact_id', contactId)
    .single();

  if (existing) {
    // Update existing
    await supabase
      .from('prompt_responses')
      .update({
        response,
        quality_score: qualityScore,
        moderation_passed: moderationPassed,
      })
      .eq('id', existing.id);
  } else {
    // Insert new
    await supabase.from('prompt_responses').insert({
      pairing_prompt_id: promptId,
      contact_id: contactId,
      response,
      quality_score: qualityScore,
      moderation_passed: moderationPassed,
    });
  }
}

// ============================================
// CHECK IF PARTNER RESPONDED
// ============================================

async function checkPartnerResponded(
  promptId: string,
  currentContactId: string,
  pairing: Pairing
): Promise<boolean> {
  const partnerId = pairing.contact_a_id === currentContactId
    ? pairing.contact_b_id
    : pairing.contact_a_id;

  const { data } = await supabase
    .from('prompt_responses')
    .select('id')
    .eq('pairing_prompt_id', promptId)
    .eq('contact_id', partnerId)
    .single();

  return !!data;
}

// ============================================
// SHARE RESPONSES WITH BOTH PARTNERS
// ============================================

async function shareResponses(promptId: string, pairing: Pairing): Promise<void> {
  // Get both responses
  const { data: responses } = await supabase
    .from('prompt_responses')
    .select('*')
    .eq('pairing_prompt_id', promptId);

  if (!responses || responses.length < 2) return;

  const contactA = await getContact(pairing.contact_a_id);
  const contactB = await getContact(pairing.contact_b_id);

  if (!contactA || !contactB) return;

  const responseA = responses.find(r => r.contact_id === pairing.contact_a_id);
  const responseB = responses.find(r => r.contact_id === pairing.contact_b_id);

  if (!responseA || !responseB) return;

  // Send B's response to A
  await sendMessageSafe({
    to: contactA.phone,
    message: `Here's what ${contactB.name || 'your match'} said:\n\n"${responseB.response}"`,
    messageType: 'partner_response',
    contactId: contactA.id,
  });

  // Send A's response to B
  await sendMessageSafe({
    to: contactB.phone,
    message: `Here's what ${contactA.name || 'your match'} said:\n\n"${responseA.response}"`,
    messageType: 'partner_response',
    contactId: contactB.id,
  });

  // Mark both as shared
  await supabase
    .from('prompt_responses')
    .update({ shared_at: new Date().toISOString() })
    .in('id', [responseA.id, responseB.id]);
}

// ============================================
// CHECK PAIRING STATE (waiting for consent, etc.)
// ============================================

type PairingState = 'awaiting_prompt_response' | 'awaiting_consent' | 'completed' | 'active';

async function getPairingState(pairing: Pairing, contact: Contact): Promise<PairingState> {
  // Check if consent has been asked but not answered
  if (pairing.status === 'ending') {
    const isContactA = contact.id === pairing.contact_a_id;
    const myConsent = isContactA ? pairing.contact_a_consent : pairing.contact_b_consent;

    if (myConsent === null) {
      return 'awaiting_consent';
    }
  }

  // Check if there's a pending prompt
  const currentPrompt = await getCurrentPromptForContact(pairing, contact);
  if (currentPrompt) {
    return 'awaiting_prompt_response';
  }

  return 'active';
}

// ============================================
// HANDLE CONSENT RESPONSE
// ============================================

async function handleConsentResponse(
  contact: Contact,
  message: string,
  pairing: Pairing
): Promise<RouteResult> {
  const isYes = /^(yes|yeah|yep|sure|definitely|absolutely|yea|ya|yup)$/i.test(message.trim());
  const isNo = /^(no|nope|nah|not really|pass|no thanks)$/i.test(message.trim());

  if (!isYes && !isNo) {
    await sendMessageSafe({
      to: contact.phone,
      message: "Just reply YES or NO - want to connect with your match?",
      messageType: 'consent_clarify',
      contactId: contact.id,
    });
    return { success: true, action: 'consent_clarify' };
  }

  // Update pairing consent
  const isContactA = contact.id === pairing.contact_a_id;
  const field = isContactA ? 'contact_a_consent' : 'contact_b_consent';

  await supabase
    .from('pairings')
    .update({ [field]: isYes })
    .eq('id', pairing.id);

  // Refresh pairing data
  const { data: updated } = await supabase
    .from('pairings')
    .select('*')
    .eq('id', pairing.id)
    .single();

  if (!updated) {
    return { success: false, action: 'error', error: 'Failed to update pairing' };
  }

  const partner = await getPartnerContact(pairing, contact);

  // Check if both responded
  if (updated.contact_a_consent !== null && updated.contact_b_consent !== null) {
    if (updated.contact_a_consent && updated.contact_b_consent) {
      // Both said yes!
      await sendMessageSafe({
        to: contact.phone,
        message: `Great news - ${partner?.name || 'your match'} wants to connect too! We'll set up a way for you to chat soon.`,
        messageType: 'consent_match',
        contactId: contact.id,
      });

      // Also notify partner if they haven't been notified yet
      if (partner) {
        await sendMessageSafe({
          to: partner.phone,
          message: `Great news - ${contact.name || 'your match'} wants to connect too! We'll set up a way for you to chat soon.`,
          messageType: 'consent_match',
          contactId: partner.id,
        });
      }

      // Mark pairing as completed
      await supabase
        .from('pairings')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', pairing.id);

      // Clear current_pairing_id for both
      await supabase
        .from('contacts')
        .update({ current_pairing_id: null })
        .in('id', [pairing.contact_a_id, pairing.contact_b_id]);

      return { success: true, action: 'consent_both_yes' };
    } else {
      // At least one said no
      await sendMessageSafe({
        to: contact.phone,
        message: "No worries! New match coming next week.",
        messageType: 'consent_no_match',
        contactId: contact.id,
      });

      // Mark pairing as ended
      await supabase
        .from('pairings')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', pairing.id);

      // Clear current_pairing_id for both
      await supabase
        .from('contacts')
        .update({ current_pairing_id: null })
        .in('id', [pairing.contact_a_id, pairing.contact_b_id]);

      return { success: true, action: 'consent_ended' };
    }
  } else {
    // Waiting for partner
    await sendMessageSafe({
      to: contact.phone,
      message: "Got it! Waiting to hear from your match.",
      messageType: 'consent_waiting',
      contactId: contact.id,
    });
    return { success: true, action: 'consent_waiting' };
  }
}

// ============================================
// MAIN HANDLER
// ============================================

export async function handlePairingMessage(
  contact: Contact,
  message: string,
  messageId?: string
): Promise<RouteResult> {
  const pairing = await getCurrentPairing(contact);
  if (!pairing) {
    // No active pairing - use AI conversation
    await handleAIConversation(contact, message, messageId);
    return { success: true, action: 'ai_conversation_no_pairing' };
  }

  // Check pairing state
  const state = await getPairingState(pairing, contact);

  // Handle consent flow
  if (state === 'awaiting_consent') {
    return handleConsentResponse(contact, message, pairing);
  }

  // Moderate content first
  const modResult = await fullModerationCheck(message, contact.id);
  if (!modResult.passed) {
    await sendMessageSafe({
      to: contact.phone,
      message: "Hey, we can't share that response. Want to try again?",
      messageType: 'moderation_block',
      contactId: contact.id,
    });
    return { success: true, action: 'blocked_by_moderation' };
  }

  // Check if there's a prompt awaiting response
  const currentPrompt = await getCurrentPromptForContact(pairing, contact);
  if (!currentPrompt) {
    // No pending prompt - AI conversation
    await handleAIConversation(contact, message, messageId);
    return { success: true, action: 'ai_conversation' };
  }

  // Store their response
  await storePromptResponse(currentPrompt.id, contact.id, message, undefined, true);

  // Check if partner responded
  const partnerResponded = await checkPartnerResponded(currentPrompt.id, contact.id, pairing);

  if (partnerResponded) {
    // Share responses with both
    await shareResponses(currentPrompt.id, pairing);
    return { success: true, action: 'responses_shared' };
  } else {
    // Acknowledge receipt
    await sendMessageSafe({
      to: contact.phone,
      message: "Got it! We'll share your match's response soon.",
      messageType: 'prompt_received',
      contactId: contact.id,
    });
    return { success: true, action: 'prompt_response_stored' };
  }
}

// ============================================
// ASK CONNECT CONSENT (called by cron)
// ============================================

export async function askConnectConsent(pairing: Pairing): Promise<void> {
  const contactA = await getContact(pairing.contact_a_id);
  const contactB = await getContact(pairing.contact_b_id);

  if (!contactA || !contactB) return;

  // Update pairing status to 'ending'
  await supabase
    .from('pairings')
    .update({ status: 'ending' })
    .eq('id', pairing.id);

  // Ask both
  await sendMessageSafe({
    to: contactA.phone,
    message: `This week's over! Would you like to connect with ${contactB.name || 'your match'}? Reply YES or NO`,
    messageType: 'consent_ask',
    contactId: contactA.id,
  });

  await sendMessageSafe({
    to: contactB.phone,
    message: `This week's over! Would you like to connect with ${contactA.name || 'your match'}? Reply YES or NO`,
    messageType: 'consent_ask',
    contactId: contactB.id,
  });
}

// ============================================
// SEND MATCH INTRO (called when pairing is created)
// ============================================

export async function sendMatchIntro(pairing: Pairing): Promise<void> {
  const contactA = await getContact(pairing.contact_a_id);
  const contactB = await getContact(pairing.contact_b_id);

  if (!contactA || !contactB) return;

  // Send intro to both
  await sendMessageSafe({
    to: contactA.phone,
    message: `You've been matched with ${contactB.name || 'someone new'} this week! We'll be sending you both a few prompts to help you get to know each other.`,
    messageType: 'match_intro',
    contactId: contactA.id,
  });

  await sendMessageSafe({
    to: contactB.phone,
    message: `You've been matched with ${contactA.name || 'someone new'} this week! We'll be sending you both a few prompts to help you get to know each other.`,
    messageType: 'match_intro',
    contactId: contactB.id,
  });
}

// ============================================
// SEND PROMPT TO PAIRING (called by cron)
// ============================================

export async function sendPromptToPairing(pairing: Pairing): Promise<boolean> {
  // Find next unsent prompt
  const { data: prompt, error } = await supabase
    .from('pairing_prompts')
    .select('*')
    .eq('pairing_id', pairing.id)
    .is('sent_at', null)
    .order('prompt_index', { ascending: true })
    .limit(1)
    .single();

  if (error || !prompt) {
    // All prompts sent
    return false;
  }

  // IDEMPOTENT CHECK: Already sent?
  if (prompt.sent_at) {
    return false;
  }

  const contactA = await getContact(pairing.contact_a_id);
  const contactB = await getContact(pairing.contact_b_id);

  if (!contactA || !contactB) return false;

  // Send to both
  await sendMessageSafe({
    to: contactA.phone,
    message: prompt.prompt_text,
    messageType: 'prompt',
    contactId: contactA.id,
  });

  await sendMessageSafe({
    to: contactB.phone,
    message: prompt.prompt_text,
    messageType: 'prompt',
    contactId: contactB.id,
  });

  // Mark as sent
  await supabase
    .from('pairing_prompts')
    .update({ sent_at: new Date().toISOString() })
    .eq('id', prompt.id);

  return true;
}
