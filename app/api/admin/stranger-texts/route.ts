import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createTrialPairing, sendPromptToPairing, askConnectConsent } from '@/lib/stranger-texts/pairing-handler';

// Simple admin auth - in production, use proper auth
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'stranger-texts-admin-2024';

function checkAuth(request: NextRequest): boolean {
  // For now, allow all requests in development
  // In production, check for auth header or session
  const authHeader = request.headers.get('x-admin-secret');
  if (authHeader === ADMIN_SECRET) return true;

  // Allow requests from same origin (admin page)
  const referer = request.headers.get('referer');
  if (referer && referer.includes('/admin/stranger-texts')) return true;

  return true; // TODO: Make this more secure
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const contactId = searchParams.get('contact_id');

  try {
    switch (action) {
      case 'list_contacts': {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('signed_up_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        return NextResponse.json({ contacts: data });
      }

      case 'get_messages': {
        if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 });

        const { data, error } = await supabase
          .from('message_logs')
          .select('*')
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        return NextResponse.json({ messages: data });
      }

      case 'get_decisions': {
        if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 });

        const { data, error } = await supabase
          .from('ai_decisions')
          .select('*')
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        return NextResponse.json({ decisions: data });
      }

      case 'reset_user': {
        if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 });

        // Delete all related data and reset contact
        await supabase.from('message_logs').delete().eq('contact_id', contactId);
        await supabase.from('ai_decisions').delete().eq('contact_id', contactId);
        await supabase.from('onboarding_responses').delete().eq('contact_id', contactId);

        // Delete pairings where this contact is involved
        const { data: pairings } = await supabase
          .from('pairings')
          .select('id')
          .or(`contact_a_id.eq.${contactId},contact_b_id.eq.${contactId}`);

        if (pairings && pairings.length > 0) {
          const pairingIds = pairings.map(p => p.id);
          await supabase.from('prompt_responses').delete().in('pairing_prompt_id',
            (await supabase.from('pairing_prompts').select('id').in('pairing_id', pairingIds)).data?.map(p => p.id) || []
          );
          await supabase.from('pairing_prompts').delete().in('pairing_id', pairingIds);
          await supabase.from('pairings').delete().in('id', pairingIds);
        }

        // Reset contact
        await supabase.from('contacts').update({
          status: 'new',
          subscription_status: 'none',
          onboarding_step: null,
          onboarding_answers: {},
          current_pairing_id: null,
          trial_started_at: null,
          trial_ends_at: null,
          payment_link_sent_at: null,
        }).eq('id', contactId);

        return NextResponse.json({ success: true });
      }

      case 'set_status': {
        if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 });
        const status = searchParams.get('status');
        if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 });

        const update: Record<string, unknown> = { status };

        // Also update subscription_status
        if (status === 'active') {
          update.subscription_status = 'active';
        } else if (status === 'trial') {
          update.subscription_status = 'trial';
          update.trial_started_at = new Date().toISOString();
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 7);
          update.trial_ends_at = trialEnd.toISOString();
        }

        await supabase.from('contacts').update(update).eq('id', contactId);
        return NextResponse.json({ success: true });
      }

      case 'create_pairing': {
        if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 });

        const { data: contact } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

        const pairing = await createTrialPairing(contact);
        if (!pairing) return NextResponse.json({ error: 'Failed to create pairing' }, { status: 500 });

        return NextResponse.json({ success: true, pairing_id: pairing.id });
      }

      case 'send_next_prompt': {
        if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 });

        const { data: contact } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (!contact || !contact.current_pairing_id) {
          return NextResponse.json({ error: 'Contact has no active pairing' }, { status: 400 });
        }

        const { data: pairing } = await supabase
          .from('pairings')
          .select('*')
          .eq('id', contact.current_pairing_id)
          .single();

        if (!pairing) return NextResponse.json({ error: 'Pairing not found' }, { status: 404 });

        const sent = await sendPromptToPairing(pairing);
        return NextResponse.json({ success: true, prompt_sent: sent });
      }

      case 'end_pairing': {
        if (!contactId) return NextResponse.json({ error: 'contact_id required' }, { status: 400 });

        const { data: contact } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', contactId)
          .single();

        if (!contact || !contact.current_pairing_id) {
          return NextResponse.json({ error: 'Contact has no active pairing' }, { status: 400 });
        }

        const { data: pairing } = await supabase
          .from('pairings')
          .select('*')
          .eq('id', contact.current_pairing_id)
          .single();

        if (!pairing) return NextResponse.json({ error: 'Pairing not found' }, { status: 404 });

        // Ask for consent
        await askConnectConsent(pairing);
        return NextResponse.json({ success: true });
      }

      case 'get_pairings': {
        const { data, error } = await supabase
          .from('pairings')
          .select(`
            *,
            contact_a:contacts!pairings_contact_a_id_fkey(name, phone),
            contact_b:contacts!pairings_contact_b_id_fkey(name, phone)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        return NextResponse.json({ pairings: data });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
