import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_USER_ID;

    if (!accessToken || !userId) {
      return NextResponse.json(
        { error: 'Instagram credentials not configured' },
        { status: 500 }
      );
    }

    // Fetch user's media using Instagram Graph API
    const response = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}&limit=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram posts');
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: 'No posts found' },
        { status: 404 }
      );
    }

    const latestPost = data.data[0];

    return NextResponse.json({
      id: latestPost.id,
      caption: latestPost.caption || '',
      imageUrl: latestPost.media_type === 'VIDEO' ? latestPost.thumbnail_url : latestPost.media_url,
      postUrl: latestPost.permalink,
      timestamp: latestPost.timestamp,
      platform: 'instagram'
    });
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Instagram post' },
      { status: 500 }
    );
  }
}
