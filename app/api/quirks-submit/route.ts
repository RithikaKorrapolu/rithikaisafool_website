import { put, list } from '@vercel/blob';

type QuirkSubmission = {
  quirk: string;
  submittedAt: string;
};

export async function POST(request: Request) {
  try {
    const { quirk } = await request.json();

    if (!quirk || !quirk.trim()) {
      return Response.json(
        { error: 'Quirk is required' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // Store in Vercel Blob
    let quirks: QuirkSubmission[] = [];
    try {
      const { blobs } = await list({ prefix: 'quirks-data' });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        quirks = await response.json();
      }
    } catch {
      // No existing data, start fresh
    }

    quirks.push({
      quirk: quirk.trim(),
      submittedAt: timestamp,
    });

    await put('quirks-data/submitted-quirks.json', JSON.stringify(quirks), {
      access: 'public',
      addRandomSuffix: false,
    });

    return Response.json(
      { message: 'Quirk submitted successfully!', count: quirks.length },
      { status: 200 }
    );

  } catch (error) {
    console.error('Quirk submission error:', error);
    return Response.json(
      { error: 'Failed to submit quirk' },
      { status: 500 }
    );
  }
}
