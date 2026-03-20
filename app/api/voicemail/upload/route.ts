import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validate API secret
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.VOICEMAIL_API_SECRET}`;

    if (!authHeader || authHeader !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let audioData: Blob | null = null;

    // Try to get the raw body directly (works best with iOS Shortcuts)
    try {
      const body = await request.arrayBuffer();
      if (body.byteLength > 0) {
        audioData = new Blob([body], { type: 'audio/m4a' });
      }
    } catch {
      // If raw body fails, try form data
      try {
        const formData = await request.formData();
        for (const [key, value] of formData.entries()) {
          if (value instanceof File && value.size > 0) {
            audioData = value;
            break;
          }
        }
      } catch {
        // Both methods failed
      }
    }

    if (!audioData || audioData.size === 0) {
      const contentType = request.headers.get('content-type') || 'none';
      return NextResponse.json(
        { error: 'No audio data provided', contentType },
        { status: 400 }
      );
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `voicemail-${timestamp}.m4a`;

    // Upload to Vercel Blob
    const blob = await put(filename, audioData, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Also store the latest URL in a metadata file (overwrite allowed)
    await put('voicemail-latest.json', JSON.stringify({
      url: blob.url,
      uploadedAt: new Date().toISOString(),
      filename: filename
    }), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: 'Voicemail updated successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to upload voicemail', details: errorMessage },
      { status: 500 }
    );
  }
}
