import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { askConnectConsent } from '@/lib/stranger-texts/pairing-handler';

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

  console.log('Running week-end-check cron job...');

  try {
    // Get all active pairings with their prompts
    const { data: pairings, error: pairingsError } = await supabase
      .from('pairings')
      .select(`
        *,
        pairing_prompts(*)
      `)
      .eq('status', 'active');

    if (pairingsError) {
      console.error('Error fetching pairings:', pairingsError);
      return NextResponse.json({ error: 'Failed to fetch pairings' }, { status: 500 });
    }

    if (!pairings || pairings.length === 0) {
      console.log('No active pairings found');
      return NextResponse.json({ success: true, message: 'No active pairings', consentAsked: 0 });
    }

    let consentAsked = 0;

    for (const pairing of pairings) {
      const prompts = pairing.pairing_prompts || [];

      // Check if all 3 prompts have been sent
      const allPromptsSent = prompts.length === 3 && prompts.every((p: { sent_at: string | null }) => p.sent_at !== null);

      // IDEMPOTENT CHECK: Consent already asked?
      const consentNotAsked = pairing.contact_a_consent === null && pairing.contact_b_consent === null;

      if (allPromptsSent && consentNotAsked) {
        console.log(`Asking consent for pairing ${pairing.id}`);

        await askConnectConsent(pairing);
        consentAsked++;

        console.log(`Consent asked for pairing ${pairing.id}`);
      } else if (!allPromptsSent) {
        console.log(`Pairing ${pairing.id}: Not all prompts sent yet (${prompts.filter((p: { sent_at: string | null }) => p.sent_at).length}/3)`);
      } else if (!consentNotAsked) {
        console.log(`Pairing ${pairing.id}: Consent already asked`);
      }
    }

    return NextResponse.json({
      success: true,
      pairingsProcessed: pairings.length,
      consentAsked
    });
  } catch (error) {
    console.error('Week-end-check cron error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
