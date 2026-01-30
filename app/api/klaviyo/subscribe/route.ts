import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, productName, productHandle } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
    const KLAVIYO_EMAIL_LIST_ID = process.env.KLAVIYO_LIST_ID;

    // Use specific lists for different product waitlists
    const STRANGER_SWEATSHIRT_LIST_ID = 'SyMryD';
    const CONDITION_HAT_LIST_ID = 'SJDchM';

    let KLAVIYO_WAITLIST_LIST_ID;
    if (productHandle?.includes('stranger')) {
      KLAVIYO_WAITLIST_LIST_ID = STRANGER_SWEATSHIRT_LIST_ID;
    } else if (productHandle?.includes('condition')) {
      KLAVIYO_WAITLIST_LIST_ID = CONDITION_HAT_LIST_ID;
    } else {
      KLAVIYO_WAITLIST_LIST_ID = process.env.KLAVIYO_WAITLIST_LIST_ID;
    }

    if (!KLAVIYO_API_KEY || !KLAVIYO_WAITLIST_LIST_ID || !KLAVIYO_EMAIL_LIST_ID) {
      console.error('Klaviyo API key or List IDs not configured');
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
    }

    // Step 1: Create or update profile with custom properties
    console.log('Creating profile for:', email, 'Product:', productName);

    const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
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
            properties: {
              'Waitlist Product': productName,
              'Waitlist Product Handle': productHandle,
            },
          },
        },
      }),
    });

    const profileResponseText = await profileResponse.text();
    console.log('Profile response status:', profileResponse.status);
    console.log('Profile response:', profileResponseText);

    let profileId;
    if (profileResponse.status === 201) {
      const data = JSON.parse(profileResponseText);
      profileId = data.data.id;
      console.log('Created new profile:', profileId);
    } else if (profileResponse.status === 409) {
      // Profile exists, get ID from error
      const errorData = JSON.parse(profileResponseText);
      profileId = errorData.errors?.[0]?.meta?.duplicate_profile_id;
      console.log('Profile exists, ID:', profileId);

      // Update existing profile with waitlist product
      if (profileId) {
        const updateResponse = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
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
              attributes: {
                properties: {
                  'Waitlist Product': productName,
                  'Waitlist Product Handle': productHandle,
                },
              },
            },
          }),
        });
        console.log('Update profile response:', updateResponse.status);
      }
    } else {
      console.error('Unexpected profile response:', profileResponse.status);
    }

    if (!profileId) {
      console.error('Failed to get profile ID');
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    console.log('Using profile ID:', profileId);

    // Step 2: Subscribe to both lists
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

    const [waitlistResponse, emailListResponse] = await Promise.all([
      subscribeToList(KLAVIYO_WAITLIST_LIST_ID),
      subscribeToList(KLAVIYO_EMAIL_LIST_ID),
    ]);

    console.log('Waitlist response:', waitlistResponse.status);
    console.log('Email list response:', emailListResponse.status);

    // 204 = success for this endpoint
    if ((waitlistResponse.status !== 204 && !waitlistResponse.ok) ||
        (emailListResponse.status !== 204 && !emailListResponse.ok)) {
      console.error('Failed to subscribe to one or both lists');
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Klaviyo subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
