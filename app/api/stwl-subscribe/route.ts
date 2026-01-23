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
    const listIds = ['RSaqUR', 'Sv6TeQ'];

    if (!klaviyoApiKey) {
      console.error('Missing Klaviyo API key');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Subscribe to both Klaviyo lists
    const subscribePromises = listIds.map(listId =>
      fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
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
      })
    );

    const responses = await Promise.all(subscribePromises);

    // Check if at least one succeeded
    const anySuccess = responses.some(r => r.ok || r.status === 409);

    if (!anySuccess) {
      console.error('Failed to subscribe to any list');
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
    console.error('STWL signup error:', error);
    return Response.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
