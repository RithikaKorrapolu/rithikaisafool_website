import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const LINQ_API_TOKEN = process.env.LINQ_API_TOKEN;
const LINQ_PHONE_NUMBER = process.env.LINQ_PHONE_NUMBER;
const LINQ_API_URL = 'https://api.linqapp.com/api/partner/v3/chats';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format phone number to E.164 format
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('1')
      ? `+${cleanNumber}`
      : `+1${cleanNumber}`;

    // Check if contact already exists
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('phone', formattedNumber)
      .single();

    let message: string;
    let isNewContact = false;
    let contactId: string;

    if (existingContact) {
      // Returning contact
      const name = existingContact.name || 'friend';
      message = `Hey ${name}! You're already part of the club. Text us if you need anything.`;
      contactId = existingContact.id;
    } else {
      // New contact - create in database
      const { data: newContact, error: insertError } = await supabase
        .from('contacts')
        .insert({
          phone: formattedNumber,
          source: 'website-android'
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to save contact' },
          { status: 500 }
        );
      }

      message = "This is the Stranger Texts Club. You are new to us! What should we call you?";
      isNewContact = true;
      contactId = newContact.id;
    }

    // Send message via Linq
    const response = await fetch(LINQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINQ_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: LINQ_PHONE_NUMBER,
        to: [formattedNumber],
        message: {
          parts: [{ type: 'text', value: message }]
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Linq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send message', details: errorData },
        { status: response.status }
      );
    }

    // Log the message in the messages table
    await supabase.from('messages').insert({
      contact_id: contactId,
      prompt: message,
      message_type: isNewContact ? 'onboarding' : 'returning_welcome'
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      isNewContact,
      message: isNewContact ? 'Welcome message sent!' : 'Welcome back message sent!',
      data
    });

  } catch (error) {
    console.error('Error sending Linq message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
