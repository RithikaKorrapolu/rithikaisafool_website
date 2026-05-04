import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getContactsWithReadyPendingMessages, getAndClearPendingMessages } from '@/lib/stranger-texts/pending-messages';
import { handleOnboardingV2 } from '@/lib/stranger-texts/onboarding-v2';
import { Contact } from '@/lib/stranger-texts/types';

export const dynamic = 'force-dynamic';

/**
 * Cron job to process pending onboarding messages.
 * Runs every 30 seconds via Vercel cron.
 *
 * This enables the 60-second delay for onboarding responses,
 * allowing users to send multiple messages that get aggregated.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (if configured)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get contacts with pending messages ready to process
    const contacts = await getContactsWithReadyPendingMessages();

    if (contacts.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No pending messages ready'
      });
    }

    console.log(`Processing ${contacts.length} contacts with ready pending messages`);

    const results = [];

    for (const contact of contacts) {
      try {
        // Get and combine all pending messages
        const combinedMessage = await getAndClearPendingMessages(contact.id);

        if (!combinedMessage) {
          console.log(`No messages found for contact ${contact.id}`);
          continue;
        }

        console.log(`Processing combined message for ${contact.phone}: "${combinedMessage.substring(0, 50)}..."`);

        // Process through onboarding
        const result = await handleOnboardingV2(
          contact as Contact,
          combinedMessage
        );

        results.push({
          contactId: contact.id,
          phone: contact.phone,
          success: result.success,
          newState: result.newState,
        });

      } catch (error) {
        console.error(`Error processing contact ${contact.id}:`, error);
        results.push({
          contactId: contact.id,
          phone: contact.phone,
          success: false,
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });

  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 });
  }
}
