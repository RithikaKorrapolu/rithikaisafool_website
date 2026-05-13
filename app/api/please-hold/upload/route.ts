import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import Groq from 'groq-sdk';

// Initialize Groq client (free Whisper transcription)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
      transcript?: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  lastUpdated: string;
}

// Transcribe audio using Groq Whisper (free tier)
async function transcribeAudio(audioUrl: string): Promise<string | null> {
  try {
    // Fetch the audio file from blob storage
    const response = await fetch(audioUrl);
    if (!response.ok) {
      console.log('[Please Hold] Failed to fetch audio for transcription');
      return null;
    }

    const audioBuffer = await response.arrayBuffer();
    const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

    // Transcribe using Groq's Whisper (faster and free)
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'en',
    });

    console.log(`[Please Hold] Transcribed: "${transcription.text.substring(0, 50)}..."`);
    return transcription.text;
  } catch (error) {
    console.error('[Please Hold] Transcription error:', error);
    return null;
  }
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

    // Upload WAV file to Blob (allow overwriting if re-recording same message)
    const blobPath = `please-hold/thread_${String(threadId).padStart(3, '0')}/${String(messageId).padStart(3, '0')}.wav`;

    // Use a unique path with timestamp to avoid conflicts
    const uniqueBlobPath = `please-hold/thread_${String(threadId).padStart(3, '0')}/${String(messageId).padStart(3, '0')}_${Date.now()}.wav`;

    const blob = await put(uniqueBlobPath, file, {
      access: 'public',
      contentType: 'audio/wav',
    });

    // Clean up old versions of this message
    try {
      const prefix = `please-hold/thread_${String(threadId).padStart(3, '0')}/${String(messageId).padStart(3, '0')}`;
      const { blobs } = await list({ prefix });
      for (const oldBlob of blobs) {
        if (oldBlob.url !== blob.url) {
          console.log(`[Please Hold] Cleaning up old blob: ${oldBlob.pathname}`);
          await del(oldBlob.url);
        }
      }
    } catch {
      // Ignore cleanup errors
    }

    console.log(`[Please Hold] Uploaded to: ${blob.url}`);

    // Transcribe the audio using Groq Whisper (free)
    let transcript: string | null = null;
    console.log(`[Please Hold] GROQ_API_KEY present: ${!!process.env.GROQ_API_KEY}`);
    if (process.env.GROQ_API_KEY) {
      console.log('[Please Hold] Starting transcription...');
      transcript = await transcribeAudio(blob.url);
      console.log(`[Please Hold] Transcription result: ${transcript ? transcript.substring(0, 50) + '...' : 'null'}`);
    } else {
      console.log('[Please Hold] No GROQ_API_KEY, skipping transcription');
    }

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
      transcript: transcript || undefined,
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
        audioUrl: `${msg.blobUrl}?v=${new Date(msg.uploadedAt).getTime()}`,
        duration: msg.duration,
        size: msg.size,
        uploadedAt: msg.uploadedAt,
        transcript: msg.transcript,
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
