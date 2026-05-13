import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const METADATA_KEY = 'please-hold/metadata.json';

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

async function getMetadata(): Promise<ThreadMetadata> {
  try {
    const { blobs } = await list({ prefix: METADATA_KEY });
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      return await response.json();
    }
  } catch (error) {
    console.log('[Transcribe] No existing metadata');
  }
  return { threads: [], lastUpdated: new Date().toISOString() };
}

async function saveMetadata(metadata: ThreadMetadata): Promise<void> {
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

async function transcribeAudio(audioUrl: string): Promise<string | null> {
  try {
    const response = await fetch(audioUrl);
    if (!response.ok) {
      console.log('[Transcribe] Failed to fetch audio');
      return null;
    }

    const audioBuffer = await response.arrayBuffer();
    const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'en',
    });

    console.log(`[Transcribe] Got: "${transcription.text.substring(0, 50)}..."`);
    return transcription.text;
  } catch (error) {
    console.error('[Transcribe] Error:', error);
    return null;
  }
}

// POST: Transcribe a specific message or all messages in a thread
export async function POST(request: NextRequest) {
  try {
    const { threadId, messageId } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const metadata = await getMetadata();
    const thread = metadata.threads.find(t => t.id === threadId);

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const results: Array<{ messageId: number; transcript: string | null }> = [];

    // If messageId provided, transcribe just that message; otherwise transcribe all
    const messagesToTranscribe = messageId
      ? thread.messages.filter(m => m.id === messageId)
      : thread.messages.filter(m => !m.transcript);

    for (const message of messagesToTranscribe) {
      console.log(`[Transcribe] Processing thread ${threadId}, message ${message.id}`);
      const transcript = await transcribeAudio(message.blobUrl);

      if (transcript) {
        message.transcript = transcript;
        results.push({ messageId: message.id, transcript });
      } else {
        results.push({ messageId: message.id, transcript: null });
      }
    }

    // Save updated metadata
    metadata.lastUpdated = new Date().toISOString();
    thread.updatedAt = new Date().toISOString();
    await saveMetadata(metadata);

    return NextResponse.json({
      success: true,
      transcribed: results.filter(r => r.transcript).length,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error('[Transcribe] Error:', error);
    return NextResponse.json(
      { error: 'Transcription failed', details: String(error) },
      { status: 500 }
    );
  }
}
