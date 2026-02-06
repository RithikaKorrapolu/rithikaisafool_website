export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return Response.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format phone number to E.164 format
    let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone; // Assume US if 10 digits
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    if (formattedPhone.length < 11) {
      return Response.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    const klaviyoApiKey = process.env.KLAVIYO_API_KEY;
    const listIds = ['Sv6TeQ', 'WH4hb5']; // STWL list + SMS list

    if (!klaviyoApiKey) {
      console.error('Missing Klaviyo API key');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Subscribe to both Klaviyo lists with SMS consent
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
                      phone_number: formattedPhone,
                      subscriptions: {
                        sms: {
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

    // Log responses for debugging
    for (let i = 0; i < responses.length; i++) {
      const responseText = await responses[i].clone().text();
      console.log(`List ${listIds[i]} response:`, responses[i].status, responseText);
    }

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
