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
    const listId = 'RSaqUR';

    if (!klaviyoApiKey) {
      console.error('Missing Klaviyo API key');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

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
                id: listId
              }
            }
          }
        }
      }),
    });

    if (!response.ok && response.status !== 409) {
      console.error('Failed to subscribe to Klaviyo list');
      return Response.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    return Response.json(
      { message: "You're in!" },
      { status: 200 }
    );

  } catch (error) {
    console.error('Coming soon signup error:', error);
    return Response.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
