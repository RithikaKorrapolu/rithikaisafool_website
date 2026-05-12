import { NextResponse } from 'next/server';
import {
  getPleaseHoldData,
  getStrands,
  getStrand,
  getDeviceStatus,
  createStrand,
  recordMessage,
  resetData,
  startPlayback,
  stopPlayback,
  calculateStrandAnalytics,
} from '@/lib/please-hold/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'strands') {
      const strands = await getStrands();
      return NextResponse.json({ strands });
    }

    if (type === 'status') {
      const status = await getDeviceStatus();
      return NextResponse.json({ status });
    }

    if (type === 'analytics') {
      const strandId = searchParams.get('strandId');
      if (!strandId) {
        return NextResponse.json({ error: 'strandId required' }, { status: 400 });
      }
      const strand = await getStrand(parseInt(strandId));
      if (!strand) {
        return NextResponse.json({ error: 'Strand not found' }, { status: 404 });
      }
      const analytics = calculateStrandAnalytics(strand);
      return NextResponse.json({ analytics });
    }

    // Default: return all data
    const data = await getPleaseHoldData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Please Hold API error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'new-strand': {
        const strand = await createStrand(body.title, body.description);
        return NextResponse.json({ success: true, strand });
      }

      case 'record': {
        const message = await recordMessage(body.duration, body.transcript);
        if (!message) {
          return NextResponse.json(
            { error: 'No active strand. Create a new strand first.' },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true, message });
      }

      case 'play': {
        await startPlayback(body.strandId || 0, body.messageIndex || 0);
        return NextResponse.json({ success: true });
      }

      case 'stop': {
        await stopPlayback();
        return NextResponse.json({ success: true });
      }

      case 'reset': {
        await resetData();
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Please Hold API error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}
