import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    const username = process.env.TWITTER_USERNAME;

    if (!bearerToken || !username) {
      return NextResponse.json(
        { error: 'Twitter credentials not configured' },
        { status: 500 }
      );
    }

    // First, get user ID from username
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error('Failed to fetch Twitter user');
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    // Then fetch user's tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at,text,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      }
    );

    if (!tweetsResponse.ok) {
      throw new Error('Failed to fetch tweets');
    }

    const tweetsData = await tweetsResponse.json();

    if (!tweetsData.data || tweetsData.data.length === 0) {
      return NextResponse.json(
        { error: 'No tweets found' },
        { status: 404 }
      );
    }

    const latestTweet = tweetsData.data[0];
    const media = tweetsData.includes?.media?.[0];

    return NextResponse.json({
      id: latestTweet.id,
      caption: latestTweet.text,
      imageUrl: media?.url || media?.preview_image_url || null,
      postUrl: `https://twitter.com/${username}/status/${latestTweet.id}`,
      timestamp: latestTweet.created_at,
      platform: 'twitter'
    });
  } catch (error) {
    console.error('Twitter API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter post' },
      { status: 500 }
    );
  }
}
