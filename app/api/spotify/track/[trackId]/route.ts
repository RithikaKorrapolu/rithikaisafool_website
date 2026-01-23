import { NextRequest, NextResponse } from "next/server";

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return accessToken;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const { trackId } = await params;
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const track = await response.json();

    return NextResponse.json({
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      albumArt: track.album.images[0]?.url || "",
      previewUrl: track.preview_url,
      duration: track.duration_ms / 1000,
      spotifyUrl: track.external_urls.spotify,
    });
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json({ error: "Failed to fetch track" }, { status: 500 });
  }
}
