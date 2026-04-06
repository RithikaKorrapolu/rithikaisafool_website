import { put, list, del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

type Nickname = {
  nickname: string;
  submittedAt: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname } = body;

    if (!nickname || !nickname.trim()) {
      return NextResponse.json({ error: 'Missing nickname' }, { status: 400 });
    }

    // Get current nicknames from blob
    let nicknames: Nickname[] = [];
    let existingBlobUrl: string | null = null;
    try {
      const { blobs } = await list({ prefix: 'nicknames-data' });
      if (blobs.length > 0) {
        existingBlobUrl = blobs[0].url;
        const response = await fetch(blobs[0].url);
        nicknames = await response.json();
      }
    } catch {
      // No existing data, start fresh
    }

    // Add new nickname
    const newNickname: Nickname = {
      nickname: nickname.trim(),
      submittedAt: Date.now(),
    };

    nicknames.push(newNickname);

    // Delete old blob if exists
    if (existingBlobUrl) {
      try {
        await del(existingBlobUrl);
      } catch {
        // Ignore delete errors
      }
    }

    // Save to blob
    await put(`nicknames-data/nicknames-${Date.now()}.json`, JSON.stringify(nicknames), {
      access: 'public',
    });

    return NextResponse.json({ success: true, count: nicknames.length });
  } catch (error) {
    console.error('Error saving nickname:', error);
    return NextResponse.json({ error: 'Failed to save nickname' }, { status: 500 });
  }
}
