import { LINQ_API_URL } from './constants';
import { logOutboundMessage } from './logger';

const LINQ_API_TOKEN = process.env.LINQ_API_TOKEN!;
const LINQ_PHONE_NUMBER = process.env.LINQ_PHONE_NUMBER!;

interface SendMessageOptions {
  to: string;
  message: string;
  reaction?: string;
  screenEffect?: 'fireworks' | 'confetti' | 'lasers' | 'celebration' | 'balloons' | 'spotlight' | 'echo' | 'love' | 'invisible-ink' | 'gentle' | 'loud' | 'slam';
  imageUrl?: string;
}

interface SendMessageSafeOptions extends SendMessageOptions {
  messageType?: string;
  contactId?: string;
}

interface LinqResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendMessage({ to, message, imageUrl }: SendMessageOptions): Promise<LinqResponse> {
  try {
    // Build message parts
    const parts: Array<{ type: string; value?: string; url?: string }> = [];
    parts.push({ type: 'text', value: message });
    if (imageUrl) {
      parts.push({ type: 'image', url: imageUrl });
    }

    const response = await fetch(LINQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINQ_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: LINQ_PHONE_NUMBER,
        to: [to],
        message: { parts }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Linq API error:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Linq send error:', error);
    return { success: false, error: String(error) };
  }
}

// Safe version that logs and respects DRY_RUN mode
export async function sendMessageSafe(options: SendMessageSafeOptions): Promise<LinqResponse> {
  const isDryRun = process.env.DRY_RUN_SMS === 'true';

  // Always log outbound messages
  if (options.contactId) {
    await logOutboundMessage(
      options.contactId,
      options.to,
      options.message,
      options.messageType || 'unknown',
      isDryRun
    );
  }

  if (isDryRun) {
    console.log(`[DRY RUN] Would send to ${options.to}: ${options.message}`);
    return { success: true, messageId: 'dry-run' };
  }

  return sendMessage({ to: options.to, message: options.message });
}

// Reaction types: love, like, dislike, laugh, emphasize, question
type ReactionType = 'love' | 'like' | 'dislike' | 'laugh' | 'emphasize' | 'question';

const LINQ_MESSAGES_URL = 'https://api.linqapp.com/api/partner/v3/messages';

export async function sendReaction(messageId: string, reactionType: ReactionType = 'love'): Promise<LinqResponse> {
  try {
    const response = await fetch(`${LINQ_MESSAGES_URL}/${messageId}/reactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINQ_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'add',
        type: reactionType,
        part_index: 0
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Linq reaction error:', errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error('Linq reaction error:', error);
    return { success: false, error: String(error) };
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleanNumber = phone.replace(/\D/g, '');
  return cleanNumber.startsWith('1')
    ? `+${cleanNumber}`
    : `+1${cleanNumber}`;
}

// Contact Card - Sets up iMessage Name and Photo Sharing
const LINQ_CONTACT_CARD_URL = 'https://api.linqapp.com/api/partner/v3/contact_card';

interface ContactCardOptions {
  firstName: string;
  lastName?: string;
  imageUrl?: string;
}

export async function setupContactCard(options: ContactCardOptions): Promise<LinqResponse> {
  try {
    const body: Record<string, unknown> = {
      phone_number: LINQ_PHONE_NUMBER,
      first_name: options.firstName,
    };

    if (options.lastName) {
      body.last_name = options.lastName;
    }
    if (options.imageUrl) {
      body.image_url = options.imageUrl;
    }

    const response = await fetch(LINQ_CONTACT_CARD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINQ_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Linq contact card error:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Linq contact card error:', error);
    return { success: false, error: String(error) };
  }
}

// Mark all messages in a chat as read (sends read receipt to user)
const LINQ_CHATS_URL = 'https://api.linqapp.com/api/partner/v3/chats';

export async function markChatAsRead(chatId: string): Promise<LinqResponse> {
  try {
    const response = await fetch(`${LINQ_CHATS_URL}/${chatId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINQ_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.text();
      console.error('Linq mark read error:', errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error('Linq mark read error:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateContactCard(options: Partial<ContactCardOptions>): Promise<LinqResponse> {
  try {
    const body: Record<string, unknown> = {};

    if (options.firstName) {
      body.first_name = options.firstName;
    }
    if (options.lastName) {
      body.last_name = options.lastName;
    }
    if (options.imageUrl) {
      body.image_url = options.imageUrl;
    }

    const response = await fetch(`${LINQ_CONTACT_CARD_URL}?phone_number=${encodeURIComponent(LINQ_PHONE_NUMBER)}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${LINQ_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Linq contact card update error:', errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error('Linq contact card update error:', error);
    return { success: false, error: String(error) };
  }
}
