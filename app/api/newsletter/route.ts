export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return Response.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const klaviyoApiKey = process.env.KLAVIYO_API_KEY;
    const klaviyoListId = 'RSaqUR'; // Sweet Things newsletter list

    if (!klaviyoApiKey) {
      console.error('Missing Klaviyo API key');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!klaviyoListId) {
      console.error('Missing Klaviyo List ID');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Subscribe to Klaviyo list using the subscription endpoint
    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email: email,
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: 'SUBSCRIBED'
                        }
                      }
                    }
                  }
                }
              ]
            },
            historical_import: false
          },
          relationships: {
            list: {
              data: {
                type: 'list',
                id: klaviyoListId
              }
            }
          }
        }
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Klaviyo API error:', data);

      // Check for duplicate/already subscribed
      if (data.errors?.[0]?.detail?.includes('already') || response.status === 409) {
        return Response.json(
          { message: 'You are already subscribed!' },
          { status: 200 }
        );
      }

      return Response.json(
        { error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    return Response.json(
      { message: "You're in baby!" },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return Response.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}
