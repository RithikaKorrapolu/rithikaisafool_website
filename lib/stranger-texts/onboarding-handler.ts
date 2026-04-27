import { supabase } from '@/lib/supabase';
import { sendMessage, sendReaction } from './linq-client';
import { MESSAGES, ONBOARDING_QUESTIONS, NAME_REACTIONS, TRIAL_DURATION_DAYS } from './constants';
import { Contact, OnboardingStep } from './types';
import { generateNameReaction } from './ai-handler';

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
  const step = contact.onboarding_step || 'awaiting_name';

  switch (step) {
    case 'awaiting_name':
      return handleNameStep(contact, incomingMessage, messageId);
    case 'awaiting_q1':
      return handleQuestionStep(contact, incomingMessage, 0, messageId);
    case 'awaiting_q2':
      return handleQuestionStep(contact, incomingMessage, 1, messageId);
    case 'awaiting_q3':
      return handleQuestionStep(contact, incomingMessage, 2, messageId);
    default:
      return { success: false, error: 'Unknown onboarding step' };
  }
}

async function handleNameStep(
  contact: Contact,
  name: string,
  messageId?: string
): Promise<OnboardingResult> {
  const trimmedName = name.trim();

  // React to their name with a heart
  if (messageId) {
    await sendReaction(messageId, '❤️');
  }

  // Check if this is the first person with this name
  const { count } = await supabase
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .ilike('name', trimmedName);

  let nameReaction: string;
  if (count === 0) {
    nameReaction = MESSAGES.firstWithName(trimmedName);
  } else {
    // Use AI to generate a natural reaction, or fall back to random
    try {
      nameReaction = await generateNameReaction(trimmedName);
    } catch {
      nameReaction = NAME_REACTIONS[Math.floor(Math.random() * NAME_REACTIONS.length)];
    }
  }

  // Update contact with name
  await supabase
    .from('contacts')
    .update({
      name: trimmedName,
      onboarding_step: 'awaiting_q1',
      last_message_at: new Date().toISOString(),
    })
    .eq('id', contact.id);

  // Send name reaction then first question
  await sendMessage({ to: contact.phone, message: nameReaction });

  // Small delay then send first question
  await new Promise(resolve => setTimeout(resolve, 1500));
  await sendMessage({ to: contact.phone, message: ONBOARDING_QUESTIONS[0].question });

  // Log messages
  await supabase.from('messages').insert([
    {
      contact_id: contact.id,
      prompt: nameReaction,
      direction: 'outbound',
      message_type: 'onboarding',
    },
    {
      contact_id: contact.id,
      prompt: ONBOARDING_QUESTIONS[0].question,
      direction: 'outbound',
      message_type: 'onboarding',
    },
  ]);

  return { success: true, newStep: 'awaiting_q1' };
}

async function handleQuestionStep(
  contact: Contact,
  answer: string,
  questionIndex: number,
  messageId?: string
): Promise<OnboardingResult> {
  const question = ONBOARDING_QUESTIONS[questionIndex];
  const nextQuestionIndex = questionIndex + 1;
  const isLastQuestion = nextQuestionIndex >= ONBOARDING_QUESTIONS.length;

  // React to their answer with a heart
  if (messageId) {
    await sendReaction(messageId, '❤️');
  }

  // Store the answer
  const updatedAnswers = {
    ...contact.onboarding_answers,
    [question.key]: answer.trim(),
  };

  if (isLastQuestion) {
    // Complete onboarding, start trial
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + TRIAL_DURATION_DAYS);

    await supabase
      .from('contacts')
      .update({
        onboarding_answers: updatedAnswers,
        onboarding_step: 'complete',
        status: 'trial',
        trial_started_at: new Date().toISOString(),
        trial_ends_at: trialEnds.toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', contact.id);

    // Send completion message
    await sendMessage({ to: contact.phone, message: MESSAGES.onboardingComplete });

    await supabase.from('messages').insert({
      contact_id: contact.id,
      prompt: MESSAGES.onboardingComplete,
      direction: 'outbound',
      message_type: 'onboarding_complete',
    });

    return { success: true, newStep: 'complete' };
  } else {
    // Move to next question
    const nextStep = `awaiting_q${nextQuestionIndex + 1}` as OnboardingStep;
    const nextQuestion = ONBOARDING_QUESTIONS[nextQuestionIndex];

    await supabase
      .from('contacts')
      .update({
        onboarding_answers: updatedAnswers,
        onboarding_step: nextStep,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', contact.id);

    // Small delay then send next question
    await new Promise(resolve => setTimeout(resolve, 1500));
    await sendMessage({ to: contact.phone, message: nextQuestion.question });

    await supabase.from('messages').insert({
      contact_id: contact.id,
      prompt: nextQuestion.question,
      direction: 'outbound',
      message_type: 'onboarding',
    });

    return { success: true, newStep: nextStep };
  }
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
