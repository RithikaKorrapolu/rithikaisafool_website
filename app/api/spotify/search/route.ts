import { NextRequest, NextResponse } from 'next/server';

// Cache for access token
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  // Set expiry 5 minutes before actual expiry to be safe
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken as string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get('title');
  const artist = searchParams.get('artist');

  if (!title || !artist) {
    return NextResponse.json({ error: 'Title and artist required' }, { status: 400 });
  }

  try {
    const token = await getAccessToken();

    // Search for the track
    const query = encodeURIComponent(`track:${title} artist:${artist}`);
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search Spotify');
    }

    const data = await response.json();
    const track = data.tracks?.items?.[0];

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return NextResponse.json({
      albumCover: track.album.images[0]?.url,
      name: track.name,
      artist: track.artists[0]?.name,
    });
  } catch (error) {
    console.error('Spotify search error:', error);
    return NextResponse.json({ error: 'Failed to search for track' }, { status: 500 });
  }
}
