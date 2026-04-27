import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { startOnboarding } from '@/lib/stranger-texts/onboarding-handler';
import { formatPhoneNumber } from '@/lib/stranger-texts/linq-client';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    // Check if contact already exists
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id, name, status')
      .eq('phone', formattedNumber)
      .single();

    if (existingContact) {
      // Returning contact
      const name = existingContact.name || 'friend';
      return NextResponse.json({
        success: true,
        isNewContact: false,
        message: `Hey ${name}! You're already part of the club.`,
      });
    }

    // New contact - create in database
    const { data: newContact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        phone: formattedNumber,
        source: 'website-android',
        status: 'new',
      })
      .select()
      .single();

    if (insertError || !newContact) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save contact' },
        { status: 500 }
      );
    }

    // Start onboarding - sends "Nice, you made it..." and "What should we call you?"
    await startOnboarding(newContact);

    return NextResponse.json({
      success: true,
      isNewContact: true,
      message: 'Welcome message sent!',
    });

  } catch (error) {
    console.error('Error sending Linq message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
