import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
      return NextResponse.json({
        success: true,
        isNewContact: false,
        message: "You're already on the waitlist!",
      });
    }

    // Add to waitlist
    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        phone: formattedNumber,
        source: 'website-waitlist',
        status: 'waitlist',
      });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      isNewContact: true,
      message: "You're on the waitlist! We'll text you when we launch.",
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
