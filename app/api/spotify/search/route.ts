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
  const q = searchParams.get('q'); // General search query
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  // Support both old (title+artist) and new (q) search modes
  if (!q && (!title || !artist)) {
    return NextResponse.json({ error: 'Either q parameter or title+artist required' }, { status: 400 });
  }

  try {
    const token = await getAccessToken();

    // Build search query
    let query: string;
    let searchLimit: number;

    if (q) {
      // General search mode - return multiple results
      query = encodeURIComponent(q);
      searchLimit = Math.min(limit, 10); // Cap at 10 results
    } else {
      // Legacy mode - exact title+artist search
      query = encodeURIComponent(`track:${title} artist:${artist}`);
      searchLimit = 1;
    }

    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=${searchLimit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search Spotify');
    }

    const data = await response.json();
    const tracks = data.tracks?.items || [];

    if (tracks.length === 0) {
      return NextResponse.json({ error: 'No tracks found', tracks: [] }, { status: 404 });
    }

    // If using general search (q), return array of tracks
    if (q) {
      return NextResponse.json({
        tracks: tracks.map((track: { id: string; name: string; artists: { name: string }[]; album: { images: { url: string }[] } }) => ({
          id: track.id,
          title: track.name,
          artist: track.artists.map((a: { name: string }) => a.name).join(', '),
          albumCover: track.album.images[0]?.url || '',
        })),
      });
    }

    // Legacy mode - return single track info
    const track = tracks[0];
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
