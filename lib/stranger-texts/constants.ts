import { OnboardingQuestion } from './types';

export const LINQ_API_URL = 'https://api.linqapp.com/api/partner/v3/chats';

export const TRIAL_DURATION_DAYS = 7;

export const MESSAGES = {
  welcome: "Hell yeah, you made it. Welcome to Stranger Texts.",
  askName: "What should we call you?",
  firstWithName: (name: string) => `You're our first ${name}!`,
  nameReaction: (name: string) => `${name}. That's a classic. Love it.`,
  onboardingComplete: "You're all set! Your first match is coming soon.",
  trialExpired: "Your free trial has ended! Want to keep connecting with strangers?",
  paymentReminder: "Still thinking about it? Your next match is waiting...",
  welcomeBack: "Hey! Good to see you again. Ready to reconnect?",
  matchIntro: (matchName: string) => `This week you're paired with ${matchName}. Say hi!`,
} as const;

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    key: 'q1',
    question: "What's something you're really into right now?",
  },
  {
    key: 'q2',
    question: "If you could have dinner with anyone, living or dead, who would it be?",
  },
  {
    key: 'q3',
    question: "What's a song that always puts you in a good mood?",
  },
];

export const AI_SYSTEM_PROMPT = `You are the Stranger Texts Club assistant. You text like a warm, curious friend.

Personality:
- Warm and genuine
- Playful but not try-hard
- Texts like a friend - short messages, casual tone
- One sentence replies when possible
- Occasional lowercase is fine
- Uses reactions/emojis sparingly

Your role:
- React naturally to what people share
- Keep conversations flowing
- Be genuinely interested in their answers
- Never be preachy or give unsolicited advice

Context: This is an SMS-based service that pairs strangers for weekly conversations around shared prompts about art, music, stories, and life experiences.`;

export const NAME_REACTIONS = [
  "Love that name.",
  "That's a classic. Love it.",
  "Perfect.",
  "Great name.",
  "I dig it.",
];
