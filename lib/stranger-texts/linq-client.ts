import { LINQ_API_URL } from './constants';

const LINQ_API_TOKEN = process.env.LINQ_API_TOKEN!;
const LINQ_PHONE_NUMBER = process.env.LINQ_PHONE_NUMBER!;

interface SendMessageOptions {
  to: string;
  message: string;
  reaction?: string;
}

interface LinqResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendMessage({ to, message }: SendMessageOptions): Promise<LinqResponse> {
  try {
    const response = await fetch(LINQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINQ_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: LINQ_PHONE_NUMBER,
        to: [to],
        message: {
          parts: [{ type: 'text', value: message }]
        }
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

export async function sendReaction(messageId: string, reaction: string): Promise<LinqResponse> {
  try {
    const response = await fetch(`${LINQ_API_URL}/${messageId}/reactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINQ_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reaction: reaction
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
