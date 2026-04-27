import { supabase } from '@/lib/supabase';
import { formatPhoneNumber, sendMessage } from './linq-client';
import { handleOnboarding, startOnboarding } from './onboarding-handler';
import { handleAIConversation } from './ai-handler';
import { MESSAGES } from './constants';
import { Contact } from './types';

interface RouteResult {
  success: boolean;
  action: string;
  error?: string;
}

export async function routeIncomingMessage(
  fromPhone: string,
  message: string,
  messageId?: string
): Promise<RouteResult> {
  const phone = formatPhoneNumber(fromPhone);

  // Log inbound message
  console.log(`Incoming from ${phone}: ${message}`);

  // Look up contact
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Database error:', error);
    return { success: false, action: 'error', error: 'Database error' };
  }

  // Route based on contact status
  if (!contact) {
    return handleNewContact(phone, message, messageId);
  }

  // Log the inbound message
  await supabase.from('messages').insert({
    contact_id: contact.id,
    response: message,
    direction: 'inbound',
    linq_message_id: messageId,
    responded_at: new Date().toISOString(),
  });

  // Update last_message_at
  await supabase
    .from('contacts')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', contact.id);

  switch (contact.status) {
    case 'new':
      return handleNewStatus(contact, message, messageId);
    case 'onboarding':
      return handleOnboardingStatus(contact, message, messageId);
    case 'trial':
      return handleTrialStatus(contact, message, messageId);
    case 'trial_expired':
      return handleTrialExpiredStatus(contact);
    case 'active':
      return handleActiveStatus(contact, message, messageId);
    case 'cancelled':
      return handleCancelledStatus(contact);
    case 'paused':
      return handlePausedStatus(contact);
    default:
      return { success: false, action: 'unknown_status', error: `Unknown status: ${contact.status}` };
  }
}

async function handleNewContact(
  phone: string,
  message: string,
  messageId?: string
): Promise<RouteResult> {
  // Create new contact
  const { data: newContact, error } = await supabase
    .from('contacts')
    .insert({
      phone,
      source: 'inbound-sms',
      status: 'new',
    })
    .select()
    .single();

  if (error || !newContact) {
    console.error('Failed to create contact:', error);
    return { success: false, action: 'error', error: 'Failed to create contact' };
  }

  // Log the inbound message
  await supabase.from('messages').insert({
    contact_id: newContact.id,
    response: message,
    direction: 'inbound',
    linq_message_id: messageId,
    responded_at: new Date().toISOString(),
  });

  // Start onboarding
  await startOnboarding(newContact);

  return { success: true, action: 'started_onboarding' };
}

async function handleNewStatus(
  contact: Contact,
  message: string,
  messageId?: string
): Promise<RouteResult> {
  // They were created but haven't started onboarding yet
  await startOnboarding(contact);
  return { success: true, action: 'started_onboarding' };
}

async function handleOnboardingStatus(
  contact: Contact,
  message: string,
  messageId?: string
): Promise<RouteResult> {
  const result = await handleOnboarding(contact, message, messageId);
  if (result.success) {
    return { success: true, action: `onboarding_${result.newStep}` };
  }
  return { success: false, action: 'onboarding_error', error: result.error };
}

async function handleTrialStatus(
  contact: Contact,
  message: string,
  messageId?: string
): Promise<RouteResult> {
  // Check if trial has expired
  if (contact.trial_ends_at && new Date(contact.trial_ends_at) < new Date()) {
    // Update status to trial_expired
    await supabase
      .from('contacts')
      .update({ status: 'trial_expired' })
      .eq('id', contact.id);

    return handleTrialExpiredStatus({ ...contact, status: 'trial_expired' });
  }

  // Active trial - use AI conversation
  await handleAIConversation(contact, message, messageId);
  return { success: true, action: 'ai_conversation' };
}

async function handleTrialExpiredStatus(contact: Contact): Promise<RouteResult> {
  // Send payment link
  await sendMessage({
    to: contact.phone,
    message: MESSAGES.trialExpired,
  });

  // TODO: Generate and send Stripe payment link
  // const paymentLink = await createPaymentLink(contact);
  // await sendMessage({ to: contact.phone, message: paymentLink });

  await supabase
    .from('contacts')
    .update({ payment_link_sent_at: new Date().toISOString() })
    .eq('id', contact.id);

  return { success: true, action: 'sent_payment_link' };
}

async function handleActiveStatus(
  contact: Contact,
  message: string,
  messageId?: string
): Promise<RouteResult> {
  // Full subscriber - use AI conversation
  await handleAIConversation(contact, message, messageId);
  return { success: true, action: 'ai_conversation' };
}

async function handleCancelledStatus(contact: Contact): Promise<RouteResult> {
  // Welcome them back
  await sendMessage({
    to: contact.phone,
    message: MESSAGES.welcomeBack,
  });

  // TODO: Send Stripe payment link

  return { success: true, action: 'sent_welcome_back' };
}

async function handlePausedStatus(contact: Contact): Promise<RouteResult> {
  // Reactivate paused user
  await supabase
    .from('contacts')
    .update({ status: 'active' })
    .eq('id', contact.id);

  await sendMessage({
    to: contact.phone,
    message: "Welcome back! You're all set. Your next match is coming soon.",
  });

  return { success: true, action: 'reactivated' };
}
