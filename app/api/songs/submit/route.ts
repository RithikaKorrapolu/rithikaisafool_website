import { put, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

type SongTile = {
  albumCover: string;
  title: string;
  artist: string;
  memory: string;
  youtubeId: string;
  submittedAt: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { albumCover, title, artist, memory, youtubeId } = body;

    if (!title || !artist || !memory || !youtubeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current songs from blob
    let songs: SongTile[] = [];
    try {
      const { blobs } = await list({ prefix: 'songs-data' });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        songs = await response.json();
      }
    } catch {
      // No existing data, start fresh
    }

    // Add new song
    const newSong: SongTile = {
      albumCover,
      title,
      artist,
      memory,
      youtubeId,
      submittedAt: Date.now(),
    };

    songs.push(newSong);

    // Save to blob
    await put('songs-data/submitted-songs.json', JSON.stringify(songs), {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ success: true, index: songs.length - 1 });
  } catch (error) {
    console.error('Error saving song:', error);
    return NextResponse.json({ error: 'Failed to save song' }, { status: 500 });
  }
}
