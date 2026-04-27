import { NextRequest, NextResponse } from 'next/server';
import { routeIncomingMessage } from '@/lib/stranger-texts/message-router';

const LINQ_WEBHOOK_SECRET = process.env.LINQ_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature if secret is configured
    if (LINQ_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-linq-signature');
      // TODO: Implement proper signature verification when Linq provides documentation
      if (!signature) {
        console.warn('Missing webhook signature');
      }
    }

    const body = await request.json();
    console.log('Linq webhook received:', JSON.stringify(body, null, 2));

    // Parse the incoming message
    // Linq webhook format may vary - adjust based on their documentation
    const {
      from,
      message,
      id: messageId,
    } = parseLinqWebhook(body);

    if (!from || !message) {
      console.error('Missing required fields:', { from, message });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Route the message to appropriate handler
    const result = await routeIncomingMessage(from, message, messageId ?? undefined);

    console.log('Message routed:', result);

    return NextResponse.json({
      success: true,
      action: result.action,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Parse Linq webhook payload
// Adjust this based on actual Linq webhook format
function parseLinqWebhook(body: Record<string, unknown>): {
  from: string | null;
  message: string | null;
  id: string | null;
} {
  // Handle different possible Linq webhook formats

  // Format 1: Direct fields
  if (body.from && body.message) {
    const messageContent = typeof body.message === 'string'
      ? body.message
      : extractTextFromParts(body.message);

    return {
      from: body.from as string,
      message: messageContent,
      id: (body.id as string) || null,
    };
  }

  // Format 2: Nested data object
  if (body.data && typeof body.data === 'object') {
    const data = body.data as Record<string, unknown>;
    const messageContent = typeof data.message === 'string'
      ? data.message
      : extractTextFromParts(data.message);

    return {
      from: (data.from as string) || null,
      message: messageContent,
      id: (data.id as string) || null,
    };
  }

  // Format 3: Chat/message event
  if (body.event === 'message.received' && body.payload) {
    const payload = body.payload as Record<string, unknown>;
    const messageContent = extractTextFromParts(payload.message);

    return {
      from: (payload.from as string) || null,
      message: messageContent,
      id: (payload.id as string) || null,
    };
  }

  return { from: null, message: null, id: null };
}

function extractTextFromParts(message: unknown): string | null {
  if (typeof message === 'string') {
    return message;
  }

  if (message && typeof message === 'object' && 'parts' in message) {
    const parts = (message as { parts: Array<{ type: string; value?: string }> }).parts;
    const textPart = parts.find(p => p.type === 'text');
    return textPart?.value || null;
  }

  return null;
}

// Also handle GET for webhook verification (if Linq requires it)
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');

  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ status: 'Webhook endpoint ready' });
}
