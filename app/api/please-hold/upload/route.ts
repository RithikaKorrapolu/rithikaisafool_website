import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';

// Metadata structure stored in Blob
interface ThreadMetadata {
  threads: Array<{
    id: number;
    messages: Array<{
      id: number;
      blobUrl: string;
      duration: number;
      size: number;
      uploadedAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  lastUpdated: string;
}

const METADATA_KEY = 'please-hold/metadata.json';

// Get current metadata from Blob
async function getMetadata(): Promise<ThreadMetadata> {
  try {
    const { blobs } = await list({ prefix: METADATA_KEY });
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      return await response.json();
    }
  } catch (error) {
    console.log('[Please Hold] No existing metadata, creating new');
  }
  return { threads: [], lastUpdated: new Date().toISOString() };
}

// Save metadata to Blob
async function saveMetadata(metadata: ThreadMetadata): Promise<void> {
  // Delete old metadata first
  try {
    const { blobs } = await list({ prefix: METADATA_KEY });
    for (const blob of blobs) {
      await del(blob.url);
    }
  } catch (error) {
    // Ignore deletion errors
  }

  await put(METADATA_KEY, JSON.stringify(metadata, null, 2), {
    access: 'public',
    contentType: 'application/json',
  });
}

// POST: Upload a new recording from the device
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const threadId = parseInt(formData.get('threadId') as string) || 1;
    const messageId = parseInt(formData.get('messageId') as string) || 1;
    const duration = parseFloat(formData.get('duration') as string) || 0;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`[Please Hold] Uploading: thread ${threadId}, message ${messageId}, ${duration}s`);

    // Upload WAV file to Blob
    const blobPath = `please-hold/thread_${String(threadId).padStart(3, '0')}/${String(messageId).padStart(3, '0')}.wav`;
    const blob = await put(blobPath, file, {
      access: 'public',
      contentType: 'audio/wav',
    });

    console.log(`[Please Hold] Uploaded to: ${blob.url}`);

    // Update metadata
    const metadata = await getMetadata();

    // Find or create thread
    let thread = metadata.threads.find(t => t.id === threadId);
    if (!thread) {
      thread = {
        id: threadId,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      metadata.threads.push(thread);
    }

    // Add message (or update if exists)
    const existingMsgIndex = thread.messages.findIndex(m => m.id === messageId);
    const messageData = {
      id: messageId,
      blobUrl: blob.url,
      duration,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    if (existingMsgIndex >= 0) {
      thread.messages[existingMsgIndex] = messageData;
    } else {
      thread.messages.push(messageData);
    }

    // Sort messages by ID
    thread.messages.sort((a, b) => a.id - b.id);
    thread.updatedAt = new Date().toISOString();

    // Sort threads by ID (newest first)
    metadata.threads.sort((a, b) => b.id - a.id);
    metadata.lastUpdated = new Date().toISOString();

    await saveMetadata(metadata);

    return NextResponse.json({
      success: true,
      url: blob.url,
      threadId,
      messageId,
      duration,
    });
  } catch (error) {
    console.error('[Please Hold] Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    );
  }
}

// GET: Retrieve all recordings metadata
export async function GET() {
  try {
    const metadata = await getMetadata();

    // Transform to match the format expected by the website
    const threads = metadata.threads.map(thread => ({
      id: thread.id,
      messages: thread.messages.map(msg => ({
        id: msg.id,
        path: `/thread_${String(thread.id).padStart(3, '0')}/${String(msg.id).padStart(3, '0')}.wav`,
        audioUrl: msg.blobUrl,
        duration: msg.duration,
        size: msg.size,
        uploadedAt: msg.uploadedAt,
      })),
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }));

    return NextResponse.json({
      threads,
      lastUpdated: metadata.lastUpdated,
      source: 'cloud',
    });
  } catch (error) {
    console.error('[Please Hold] Get metadata error:', error);
    return NextResponse.json(
      { error: 'Failed to get recordings', details: String(error) },
      { status: 500 }
    );
  }
}
