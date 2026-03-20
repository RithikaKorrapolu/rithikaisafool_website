import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get the latest voicemail URL from the metadata file
    const { blobs } = await list({ prefix: 'voicemail-latest.json' });

    let audioUrl = '';

    if (blobs.length > 0) {
      // Fetch the metadata to get the audio URL
      const metadataResponse = await fetch(blobs[0].url);
      const metadata = await metadataResponse.json();
      audioUrl = metadata.url;
    } else {
      // Fallback: find the most recent voicemail file directly
      const { blobs: audioBlobs } = await list({ prefix: 'voicemail-' });
      const voicemails = audioBlobs
        .filter(b => b.pathname.endsWith('.m4a'))
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      if (voicemails.length > 0) {
        audioUrl = voicemails[0].url;
      }
    }

    if (!audioUrl) {
      // No voicemail uploaded yet - return a default message
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! No voicemail has been recorded yet. Please check back later.</Say>
</Response>`;

      return new NextResponse(twiml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Convert M4A to MP3 via Cloudinary fetch URL transformation
    // Twilio doesn't support M4A, so we use Cloudinary to transcode on-the-fly
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    let playUrl = audioUrl;
    if (cloudName) {
      const encodedUrl = encodeURIComponent(audioUrl);
      playUrl = `https://res.cloudinary.com/${cloudName}/video/fetch/f_mp3/${encodedUrl}`;
    }

    // Return TwiML that plays the audio
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${playUrl}</Play>
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error('Greeting error:', error);

    // Return error message as TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, there was an error playing the voicemail. Please try again later.</Say>
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
