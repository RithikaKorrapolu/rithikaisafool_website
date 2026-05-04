import Anthropic from '@anthropic-ai/sdk';
import { logAIDecision } from './logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// CONTENT MODERATION
// ============================================

const BLOCKED_CATEGORIES = [
  'harassment',
  'sexual_content',
  'hate_speech',
  'threats',
  'self_harm',
  'private_info', // phone numbers, addresses, emails in responses
];

export interface ModerationResult {
  passed: boolean;
  flaggedCategories: string[];
  reason?: string;
  [key: string]: unknown;
}

/**
 * Check content for harmful or inappropriate material.
 * Uses AI to detect harassment, sexual content, hate speech, threats,
 * self-harm references, and private identifying information.
 */
export async function moderateContent(
  text: string,
  contactId: string
): Promise<ModerationResult> {
  // Quick checks for obviously safe content
  if (!text || text.trim().length < 3) {
    return { passed: true, flaggedCategories: [] };
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: `You are a content moderator. Check if the text contains any of these categories:
- harassment: bullying, insults, targeted attacks
- sexual_content: explicit sexual material, inappropriate advances
- hate_speech: discrimination, slurs, hateful content
- threats: violence, intimidation
- self_harm: references to self-harm or suicide
- private_info: phone numbers, email addresses, home addresses, SSN, or other identifying private info

Respond with valid JSON only:
{
  "passed": true/false,
  "flaggedCategories": ["category1", "category2"],
  "reason": "brief explanation if flagged"
}

If the content is safe, return: {"passed": true, "flaggedCategories": []}`,
      messages: [{ role: 'user', content: `Check this text: "${text}"` }],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse the JSON response
    let result: ModerationResult;
    try {
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: assume safe if we can't parse
        result = { passed: true, flaggedCategories: [] };
      }
    } catch {
      // If JSON parsing fails, assume safe but log it
      console.error('Failed to parse moderation response:', responseText);
      result = { passed: true, flaggedCategories: [] };
    }

    // Log the AI decision
    await logAIDecision({
      contactId,
      decisionType: 'moderation',
      inputText: text,
      result: {
        passed: result.passed,
        flaggedCategories: result.flaggedCategories,
        reason: result.reason,
      },
      actionTaken: result.passed ? 'allowed' : 'blocked',
    });

    return result;
  } catch (error) {
    console.error('Moderation error:', error);
    // On error, allow the content but log it
    await logAIDecision({
      contactId,
      decisionType: 'moderation',
      inputText: text,
      result: { error: String(error) },
      actionTaken: 'allowed_on_error',
    });
    return { passed: true, flaggedCategories: [] };
  }
}

/**
 * Quick regex-based check for private info (runs before AI check).
 * Returns true if private info is detected.
 */
export function containsPrivateInfo(text: string): boolean {
  // Phone number patterns
  const phonePattern = /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

  // Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

  // SSN pattern
  const ssnPattern = /\d{3}[-.\s]?\d{2}[-.\s]?\d{4}/;

  // Check for common patterns
  if (phonePattern.test(text)) return true;
  if (emailPattern.test(text)) return true;
  if (ssnPattern.test(text)) return true;

  return false;
}

/**
 * Combined moderation check - quick regex first, then AI if needed.
 */
export async function fullModerationCheck(
  text: string,
  contactId: string
): Promise<ModerationResult> {
  // Quick check for private info
  if (containsPrivateInfo(text)) {
    const result: ModerationResult = {
      passed: false,
      flaggedCategories: ['private_info'],
      reason: 'Contains phone number, email, or other private information',
    };

    await logAIDecision({
      contactId,
      decisionType: 'moderation',
      inputText: text,
      result,
      actionTaken: 'blocked_regex',
    });

    return result;
  }

  // Full AI moderation check
  return moderateContent(text, contactId);
}
