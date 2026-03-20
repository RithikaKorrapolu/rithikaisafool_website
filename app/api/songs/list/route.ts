import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

type SongTile = {
  albumCover: string;
  title: string;
  artist: string;
  memory: string;
  youtubeId: string;
  submittedAt: number;
};

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'songs-data' });

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      const songs: SongTile[] = await response.json();
      return NextResponse.json({ songs });
    }

    return NextResponse.json({ songs: [] });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ songs: [] });
  }
}
