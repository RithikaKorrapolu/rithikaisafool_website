import { supabase } from '@/lib/supabase';

// ============================================
// MESSAGE LOGGING
// ============================================

interface LogMessageParams {
  contactId?: string;
  phone: string;
  direction: 'inbound' | 'outbound';
  messageText: string;
  messageType: string;
  linqMessageId?: string;
  dryRun?: boolean;
  sentSuccessfully?: boolean;
}

export async function logMessage(params: LogMessageParams): Promise<void> {
  try {
    await supabase.from('message_logs').insert({
      contact_id: params.contactId || null,
      phone: params.phone,
      direction: params.direction,
      message_text: params.messageText,
      message_type: params.messageType,
      linq_message_id: params.linqMessageId || null,
      dry_run: params.dryRun || false,
      sent_successfully: params.sentSuccessfully ?? true,
    });
  } catch (error) {
    console.error('Failed to log message:', error);
    // Don't throw - logging should not break the flow
  }
}

// ============================================
// AI DECISION LOGGING
// ============================================

interface AIDecisionResult {
  score?: number;
  passed?: boolean;
  reason?: string;
  suggestedAction?: string;
  [key: string]: unknown;
}

interface LogAIDecisionParams {
  contactId: string;
  decisionType: 'quality_check' | 'moderation' | 'follow_up' | 'state_transition' | 'classification';
  inputText: string;
  result: AIDecisionResult;
  actionTaken: string;
}

export async function logAIDecision(params: LogAIDecisionParams): Promise<void> {
  try {
    await supabase.from('ai_decisions').insert({
      contact_id: params.contactId,
      decision_type: params.decisionType,
      input_text: params.inputText,
      result: params.result,
      action_taken: params.actionTaken,
    });
  } catch (error) {
    console.error('Failed to log AI decision:', error);
    // Don't throw - logging should not break the flow
  }
}

// ============================================
// HELPER: Log inbound message
// ============================================

export async function logInboundMessage(
  phone: string,
  messageText: string,
  contactId?: string,
  linqMessageId?: string
): Promise<void> {
  await logMessage({
    contactId,
    phone,
    direction: 'inbound',
    messageText,
    messageType: 'inbound',
    linqMessageId,
  });
}

// ============================================
// HELPER: Log outbound message
// ============================================

export async function logOutboundMessage(
  contactId: string,
  phone: string,
  messageText: string,
  messageType: string,
  dryRun: boolean = false
): Promise<void> {
  await logMessage({
    contactId,
    phone,
    direction: 'outbound',
    messageText,
    messageType,
    dryRun,
  });
}

// ============================================
// HELPER: Get message history for contact
// ============================================

export async function getMessageHistory(
  contactId: string,
  limit: number = 50
): Promise<Array<{
  direction: string;
  message_text: string;
  message_type: string;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from('message_logs')
    .select('direction, message_text, message_type, created_at')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get message history:', error);
    return [];
  }

  return data || [];
}

// ============================================
// HELPER: Get AI decisions for contact
// ============================================

export async function getAIDecisions(
  contactId: string,
  limit: number = 50
): Promise<Array<{
  decision_type: string;
  input_text: string;
  result: AIDecisionResult;
  action_taken: string;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from('ai_decisions')
    .select('decision_type, input_text, result, action_taken, created_at')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get AI decisions:', error);
    return [];
  }

  return data || [];
}
