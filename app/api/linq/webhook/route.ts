import { NextRequest, NextResponse } from 'next/server';
import { routeIncomingMessage } from '@/lib/stranger-texts/message-router';
import { markChatAsRead } from '@/lib/stranger-texts/linq-client';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Linq webhook received:', JSON.stringify(body, null, 2));

    // Determine event type
    const eventType = body.event || body.type || detectEventType(body);

    switch (eventType) {
      case 'message.received':
        return handleMessageReceived(body);
      case 'message.delivered':
        return handleMessageDelivered(body);
      case 'message.read':
        return handleMessageRead(body);
      case 'message.failed':
        return handleMessageFailed(body);
      default:
        // Try to handle as incoming message if no event type
        return handleMessageReceived(body);
    }

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleMessageReceived(body: Record<string, unknown>) {
  const { from, message, id: messageId, chatId } = parseIncomingMessage(body);

  // Log raw payload to debug Linq's format
  if (!from || !message) {
    console.error('Missing required fields. Raw payload:', JSON.stringify(body));
    // Store raw payload in Supabase for debugging
    await supabase.from('messages').insert({
      prompt: 'DEBUG: ' + JSON.stringify(body),
      direction: 'inbound',
      message_type: 'debug_payload',
    });
    // Return 200 to prevent Linq from marking as failed
    return NextResponse.json({ success: true, action: 'logged_for_debug' });
  }

  // Send read receipt so user sees "Read" under their message
  if (chatId) {
    await markChatAsRead(chatId);
  }

  const result = await routeIncomingMessage(from, message, messageId ?? undefined);
  console.log('Message routed:', result);

  return NextResponse.json({
    success: true,
    action: result.action,
  });
}

async function handleMessageDelivered(body: Record<string, unknown>) {
  const messageId = extractMessageId(body);

  if (messageId) {
    await supabase
      .from('messages')
      .update({
        delivery_status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('linq_message_id', messageId);

    console.log('Message delivered:', messageId);
  }

  return NextResponse.json({ success: true, action: 'delivered' });
}

async function handleMessageRead(body: Record<string, unknown>) {
  const messageId = extractMessageId(body);

  if (messageId) {
    await supabase
      .from('messages')
      .update({
        delivery_status: 'read',
        read_at: new Date().toISOString(),
      })
      .eq('linq_message_id', messageId);

    console.log('Message read:', messageId);
  }

  return NextResponse.json({ success: true, action: 'read' });
}

async function handleMessageFailed(body: Record<string, unknown>) {
  const messageId = extractMessageId(body);
  const error = (body.error as string) || (body.reason as string) || 'Unknown error';

  if (messageId) {
    await supabase
      .from('messages')
      .update({
        delivery_status: 'failed',
      })
      .eq('linq_message_id', messageId);

    console.error('Message failed:', messageId, error);
  }

  return NextResponse.json({ success: true, action: 'failed' });
}

function detectEventType(body: Record<string, unknown>): string {
  // Try to detect event type from payload structure
  if (body.delivered_at) return 'message.delivered';
  if (body.read_at) return 'message.read';
  if (body.failed || body.error) return 'message.failed';
  if (body.from && body.message) return 'message.received';
  return 'unknown';
}

function extractMessageId(body: Record<string, unknown>): string | null {
  // Try various places where message ID might be
  if (body.message_id) return body.message_id as string;
  if (body.id) return body.id as string;
  if (body.data && typeof body.data === 'object') {
    const data = body.data as Record<string, unknown>;
    return (data.message_id as string) || (data.id as string) || null;
  }
  if (body.payload && typeof body.payload === 'object') {
    const payload = body.payload as Record<string, unknown>;
    return (payload.message_id as string) || (payload.id as string) || null;
  }
  return null;
}

function parseIncomingMessage(body: Record<string, unknown>): {
  from: string | null;
  message: string | null;
  id: string | null;
  chatId: string | null;
} {
  // Format 1: Direct fields
  if (body.from && body.message) {
    const messageContent = typeof body.message === 'string'
      ? body.message
      : extractTextFromParts(body.message);

    return {
      from: body.from as string,
      message: messageContent,
      id: (body.id as string) || null,
      chatId: (body.chat_id as string) || (body.chatId as string) || null,
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
      chatId: (data.chat_id as string) || (data.chatId as string) || null,
    };
  }

  // Format 3: Event payload
  if (body.payload && typeof body.payload === 'object') {
    const payload = body.payload as Record<string, unknown>;
    const messageContent = extractTextFromParts(payload.message);

    return {
      from: (payload.from as string) || null,
      message: messageContent,
      id: (payload.id as string) || null,
      chatId: (payload.chat_id as string) || (payload.chatId as string) || null,
    };
  }

  return { from: null, message: null, id: null, chatId: null };
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

// Handle GET for webhook verification
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
