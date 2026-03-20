import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { firstName, email, phone } = await request.json();

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
    }

    const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
    const KLAVIYO_EMAIL_LIST_ID = 'RSaqUR'; // Main RIAF newsletter
    const KLAVIYO_PHONE_LIST_ID = 'WH4hb5'; // Phone/SMS list

    if (!KLAVIYO_API_KEY) {
      console.error('Klaviyo API key not configured');
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
    }

    // Format phone number with +1 if provided
    let formattedPhone = null;
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length >= 10) {
        formattedPhone = phoneDigits.startsWith('1') ? `+${phoneDigits}` : `+1${phoneDigits}`;
      }
    }

    console.log('Subscribe request:', { email, phone: formattedPhone, firstName });

    let profileId: string | null = null;

    // Step 1: If email provided, find or create profile by email first
    if (email) {
      const emailProfileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: {
            type: 'profile',
            attributes: {
              email: email,
              ...(firstName && { first_name: firstName }),
              ...(formattedPhone && { phone_number: formattedPhone }),
            },
          },
        }),
      });

      const emailProfileText = await emailProfileResponse.text();
      console.log('Email profile response status:', emailProfileResponse.status);

      if (emailProfileResponse.status === 201) {
        const data = JSON.parse(emailProfileText);
        profileId = data.data.id;
        console.log('Created new profile with email:', profileId);
      } else if (emailProfileResponse.status === 409) {
        // Profile exists with this email, get ID and update it
        const errorData = JSON.parse(emailProfileText);
        profileId = errorData.errors?.[0]?.meta?.duplicate_profile_id;
        console.log('Profile exists with email, ID:', profileId);

        // Update existing profile with phone and first name
        if (profileId && (formattedPhone || firstName)) {
          const updateAttrs: Record<string, string> = {};
          if (formattedPhone) updateAttrs.phone_number = formattedPhone;
          if (firstName) updateAttrs.first_name = firstName;

          await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
              'Content-Type': 'application/json',
              'revision': '2024-02-15',
            },
            body: JSON.stringify({
              data: {
                type: 'profile',
                id: profileId,
                attributes: updateAttrs,
              },
            }),
          });
          console.log('Updated existing profile with phone/name');
        }
      }
    }

    // Step 2: If no email but phone provided, find or create by phone
    if (!profileId && formattedPhone) {
      const phoneProfileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: {
            type: 'profile',
            attributes: {
              phone_number: formattedPhone,
              ...(firstName && { first_name: firstName }),
            },
          },
        }),
      });

      const phoneProfileText = await phoneProfileResponse.text();
      console.log('Phone profile response status:', phoneProfileResponse.status);

      if (phoneProfileResponse.status === 201) {
        const data = JSON.parse(phoneProfileText);
        profileId = data.data.id;
        console.log('Created new profile with phone:', profileId);
      } else if (phoneProfileResponse.status === 409) {
        const errorData = JSON.parse(phoneProfileText);
        profileId = errorData.errors?.[0]?.meta?.duplicate_profile_id;
        console.log('Profile exists with phone, ID:', profileId);

        // Update with first name if provided
        if (profileId && firstName) {
          await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
              'Content-Type': 'application/json',
              'revision': '2024-02-15',
            },
            body: JSON.stringify({
              data: {
                type: 'profile',
                id: profileId,
                attributes: { first_name: firstName },
              },
            }),
          });
        }
      }
    }

    if (!profileId) {
      console.error('Failed to get profile ID');
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    // Step 3: Subscribe to lists
    const subscribeToList = async (listId: string) => {
      return fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: [{ type: 'profile', id: profileId }],
        }),
      });
    };

    // Subscribe to email list if email provided
    if (email) {
      const emailListResponse = await subscribeToList(KLAVIYO_EMAIL_LIST_ID);
      console.log('Email list response:', emailListResponse.status);
    }

    // Subscribe to phone/SMS list if phone provided
    if (formattedPhone) {
      const phoneListResponse = await subscribeToList(KLAVIYO_PHONE_LIST_ID);
      console.log('Phone list response:', phoneListResponse.status);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
