import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
    const username = process.env.TIKTOK_USERNAME;

    if (!accessToken || !username) {
      return NextResponse.json(
        { error: 'TikTok credentials not configured' },
        { status: 500 }
      );
    }

    // Fetch user's videos using TikTok API v2
    const response = await fetch(
      `https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,share_url,create_time`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_count: 1,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch TikTok videos');
    }

    const data = await response.json();

    if (!data.data?.videos || data.data.videos.length === 0) {
      return NextResponse.json(
        { error: 'No videos found' },
        { status: 404 }
      );
    }

    const latestVideo = data.data.videos[0];

    return NextResponse.json({
      id: latestVideo.id,
      caption: latestVideo.title || '',
      imageUrl: latestVideo.cover_image_url,
      postUrl: latestVideo.share_url,
      timestamp: new Date(latestVideo.create_time * 1000).toISOString(),
      platform: 'tiktok'
    });
  } catch (error) {
    console.error('TikTok API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TikTok post' },
      { status: 500 }
    );
  }
}
