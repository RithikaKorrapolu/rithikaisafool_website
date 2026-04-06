import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'nicknames-data' });

    if (blobs.length === 0) {
      return NextResponse.json({ nicknames: [], message: 'No nicknames found' });
    }

    const response = await fetch(blobs[0].url);
    const nicknames = await response.json();

    return NextResponse.json({ nicknames, blobUrl: blobs[0].url });
  } catch (error) {
    console.error('Error listing nicknames:', error);
    return NextResponse.json({ error: 'Failed to list nicknames' }, { status: 500 });
  }
}
