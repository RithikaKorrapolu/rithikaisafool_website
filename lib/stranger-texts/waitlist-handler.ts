import { supabase } from '@/lib/supabase';
import { sendMessage } from './linq-client';
import { Contact } from './types';
import { findArtworkByFeeling, getArtworkImageUrl } from './artworks-data';

// ============================================
// WAITLIST MODE - Simple pre-launch flow
// ============================================

const WAITLIST_MESSAGES = {
  // Message with the painting (title and artist name inserted dynamically)
  paintingIntro: (title: string, artistName: string) => `Here's a painting called ${title} by ${artistName} that we think fits your mood.`,

  // Confirmation message
  confirmation: "You're also officially on the Stranger Texts waitlist. We'll text you when we're ready to kick things off.",

  // If they message again
  alreadyOnList: "glad you're here, we're not quite ready yet, but we'll text you as soon as we are",
};

interface WaitlistResult {
  success: boolean;
  action: string;
  error?: string;
}

// Handle new contact joining waitlist
export async function handleWaitlistSignup(
  contact: Contact,
  message: string,
  messageId?: string
): Promise<WaitlistResult> {
  // Extract their feeling word (first word, cleaned up)
  let feeling = message.trim().toLowerCase();

  // If they said "I feel...", extract the feeling
  if (feeling.startsWith('i feel')) {
    feeling = feeling.replace(/^i feel\.?\.?\.?\s*/i, '').trim();
  }

  // Find matching artwork
  const artwork = findArtworkByFeeling(feeling);
  const imageUrl = artwork ? getArtworkImageUrl(artwork) : null;

  // Store their feeling and matched artwork
  await supabase
    .from('contacts')
    .update({
      status: 'waitlist',
      onboarding_answers: {
        feeling,
        matched_artwork_id: artwork?.id,
        matched_artwork_title: artwork?.title,
      },
      last_message_at: new Date().toISOString(),
    })
    .eq('id', contact.id);

  // Send painting with intro message
  if (imageUrl && artwork) {
    const introMsg = WAITLIST_MESSAGES.paintingIntro(artwork.title, artwork.artist);
    await sendMessage({
      to: contact.phone,
      message: introMsg,
      imageUrl,
    });
    await supabase.from('messages').insert({
      contact_id: contact.id,
      prompt: `[Image: ${artwork.title}] ${introMsg}`,
      direction: 'outbound',
      message_type: 'waitlist_painting',
    });
    await new Promise(r => setTimeout(r, 1500));
  }

  // Send confirmation message
  await sendMessage({ to: contact.phone, message: WAITLIST_MESSAGES.confirmation });
  await supabase.from('messages').insert({
    contact_id: contact.id,
    prompt: WAITLIST_MESSAGES.confirmation,
    direction: 'outbound',
    message_type: 'waitlist_welcome',
  });

  return { success: true, action: 'waitlist_signup' };
}

// Handle existing waitlist contact messaging again
export async function handleWaitlistMessage(
  contact: Contact,
  message: string,
  messageId?: string
): Promise<WaitlistResult> {
  await sendMessage({
    to: contact.phone,
    message: WAITLIST_MESSAGES.alreadyOnList,
  });

  // Log message
  await supabase.from('messages').insert({
    contact_id: contact.id,
    prompt: WAITLIST_MESSAGES.alreadyOnList,
    direction: 'outbound',
    message_type: 'waitlist_reminder',
  });

  // Update last message time
  await supabase
    .from('contacts')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', contact.id);

  return { success: true, action: 'waitlist_reminder' };
}

// Start waitlist flow for new contact
export async function startWaitlist(
  contact: Contact,
  initialMessage: string
): Promise<void> {
  await handleWaitlistSignup(contact, initialMessage);
}
