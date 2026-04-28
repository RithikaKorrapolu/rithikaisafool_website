export type ContactStatus =
  | 'new'
  | 'onboarding'
  | 'trial'
  | 'trial_expired'
  | 'active'
  | 'cancelled'
  | 'paused';

export type OnboardingStep =
  | 'awaiting_name'
  | 'awaiting_q1'
  | 'awaiting_q2'
  | 'awaiting_q3'
  | 'in_progress'
  | 'complete';

export type MessageDirection = 'inbound' | 'outbound';

export interface Contact {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  signed_up_at: string;
  source: string;
  notes: string | null;
  matches: string[] | null;
  is_active: boolean;
  status: ContactStatus;
  onboarding_step: OnboardingStep | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  subscription_id: string | null;
  payment_link_sent_at: string | null;
  last_message_at: string | null;
  current_match_id: string | null;
  onboarding_answers: Record<string, string>;
}

export interface Message {
  id: string;
  contact_id: string;
  prompt: string | null;
  response: string | null;
  sent_at: string;
  responded_at: string | null;
  message_type: string | null;
  direction: MessageDirection;
  linq_message_id: string | null;
}

export interface Pairing {
  id: string;
  contact_a_id: string;
  contact_b_id: string;
  week_start: string;
  created_at: string;
  prompt: string | null;
  contact_a_responded: boolean;
  contact_b_responded: boolean;
}

export interface LinqIncomingMessage {
  id: string;
  from: string;
  to: string;
  message: {
    parts: Array<{
      type: 'text' | 'image' | 'video';
      value?: string;
      url?: string;
    }>;
  };
  timestamp: string;
}

export interface LinqOutgoingMessage {
  from: string;
  to: string[];
  message: {
    parts: Array<{
      type: 'text';
      value: string;
    }>;
  };
}

export interface OnboardingQuestion {
  key: string;
  question: string;
  followUp?: string;
}
