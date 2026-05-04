import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendMessageSafe } from '@/lib/stranger-texts/linq-client';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow without secret
  if (process.env.NODE_ENV === 'development') return true;

  if (!cronSecret) {
    console.warn('CRON_SECRET not set');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Running send-prompt cron job...');

  try {
    // Get all active pairings
    const { data: pairings, error: pairingsError } = await supabase
      .from('pairings')
      .select(`
        *,
        contact_a:contacts!pairings_contact_a_id_fkey(*),
        contact_b:contacts!pairings_contact_b_id_fkey(*)
      `)
      .eq('status', 'active');

    if (pairingsError) {
      console.error('Error fetching pairings:', pairingsError);
      return NextResponse.json({ error: 'Failed to fetch pairings' }, { status: 500 });
    }

    if (!pairings || pairings.length === 0) {
      console.log('No active pairings found');
      return NextResponse.json({ success: true, message: 'No active pairings', promptsSent: 0 });
    }

    let promptsSent = 0;

    for (const pairing of pairings) {
      // Find next unsent prompt for this pairing
      const { data: prompt, error: promptError } = await supabase
        .from('pairing_prompts')
        .select('*')
        .eq('pairing_id', pairing.id)
        .is('sent_at', null)
        .order('prompt_index', { ascending: true })
        .limit(1)
        .single();

      if (promptError && promptError.code !== 'PGRST116') {
        console.error(`Error fetching prompt for pairing ${pairing.id}:`, promptError);
        continue;
      }

      if (!prompt) {
        console.log(`No unsent prompts for pairing ${pairing.id}`);
        continue;
      }

      // IDEMPOTENT CHECK: Already sent? (double-check)
      if (prompt.sent_at) {
        console.log(`Prompt ${prompt.id} already sent, skipping`);
        continue;
      }

      const contactA = pairing.contact_a;
      const contactB = pairing.contact_b;

      if (!contactA || !contactB) {
        console.error(`Missing contacts for pairing ${pairing.id}`);
        continue;
      }

      // Send prompt to both contacts
      console.log(`Sending prompt ${prompt.prompt_index} to pairing ${pairing.id}`);

      await sendMessageSafe({
        to: contactA.phone,
        message: prompt.prompt_text,
        messageType: 'prompt',
        contactId: contactA.id,
      });

      await sendMessageSafe({
        to: contactB.phone,
        message: prompt.prompt_text,
        messageType: 'prompt',
        contactId: contactB.id,
      });

      // Mark prompt as sent
      await supabase
        .from('pairing_prompts')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', prompt.id);

      promptsSent++;
      console.log(`Prompt ${prompt.id} sent successfully`);
    }

    return NextResponse.json({
      success: true,
      pairingsProcessed: pairings.length,
      promptsSent
    });
  } catch (error) {
    console.error('Send-prompt cron error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
