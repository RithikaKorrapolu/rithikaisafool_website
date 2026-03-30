export async function POST(request: Request) {
  try {
    const { name, lastName, phone, subscribeNewsletter, email } = await request.json();

    if (!name || !name.trim()) {
      return Response.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

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
    const listIds = ['Sv6TeQ']; // STWL list only

    if (!klaviyoApiKey) {
      console.error('Missing Klaviyo API key');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Step 1: Create or update profile with phone number and SMS consent
    console.log('Creating profile for:', name.trim(), lastName?.trim() || '', formattedPhone);

    const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            phone_number: formattedPhone,
            first_name: name.trim(),
            ...(lastName?.trim() && { last_name: lastName.trim() }),
            properties: {
              'SMS Source': 'STWL Signup'
            }
          }
        }
      }),
    });

    const profileResponseText = await profileResponse.text();
    console.log('Profile response:', profileResponse.status, profileResponseText);

    let profileId: string | null = null;

    if (profileResponse.status === 201) {
      // New profile created
      const data = JSON.parse(profileResponseText);
      profileId = data.data.id;
      console.log('Created new profile:', profileId);
    } else if (profileResponse.status === 409) {
      // Profile already exists, get the ID
      const errorData = JSON.parse(profileResponseText);
      profileId = errorData.errors?.[0]?.meta?.duplicate_profile_id;
      console.log('Profile exists, ID:', profileId);

      // Update existing profile with first and last name
      if (profileId) {
        await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
            'Content-Type': 'application/json',
            'revision': '2024-10-15',
          },
          body: JSON.stringify({
            data: {
              type: 'profile',
              id: profileId,
              attributes: {
                first_name: name.trim(),
                ...(lastName?.trim() && { last_name: lastName.trim() }),
                properties: {
                  'SMS Source': 'STWL Signup'
                }
              }
            }
          }),
        });
        console.log('Updated existing profile with name');
      }
    } else {
      console.error('Unexpected profile response:', profileResponse.status);
    }

    if (!profileId) {
      console.error('Failed to get profile ID');
      return Response.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Step 2: Subscribe profile to SMS with consent on BOTH lists
    console.log('Subscribing profile to SMS on both lists...');

    const smsConsentPromises = listIds.map(listId =>
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
                          },
                          transactional: {
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

    const smsConsentResponses = await Promise.all(smsConsentPromises);

    for (let i = 0; i < smsConsentResponses.length; i++) {
      const responseText = await smsConsentResponses[i].clone().text();
      console.log(`SMS consent for list ${listIds[i]} response:`, smsConsentResponses[i].status, responseText);
    }

    // Step 3: Add profile to both lists directly (backup)
    console.log('Adding profile to lists directly...');

    const addToListPromises = listIds.map(listId =>
      fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-10-15',
        },
        body: JSON.stringify({
          data: [
            {
              type: 'profile',
              id: profileId
            }
          ]
        }),
      })
    );

    const listResponses = await Promise.all(addToListPromises);

    // Log responses for debugging
    for (let i = 0; i < listResponses.length; i++) {
      const responseText = await listResponses[i].clone().text();
      console.log(`Add to list ${listIds[i]} response:`, listResponses[i].status, responseText || '(empty - 204 success)');
    }

    // Check if at least one list add succeeded (204 = success for this endpoint)
    const anySuccess = listResponses.some(r => r.status === 204 || r.ok);

    if (!anySuccess) {
      console.error('Failed to add to any list');
      return Response.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Step 4: Subscribe to newsletter if checkbox was checked
    if (subscribeNewsletter && email) {
      const newsletterListId = 'RSaqUR'; // Main newsletter list
      console.log('Subscribing to newsletter with email:', email);

      // First update the profile with the email address
      if (profileId) {
        await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
            'Content-Type': 'application/json',
            'revision': '2024-10-15',
          },
          body: JSON.stringify({
            data: {
              type: 'profile',
              id: profileId,
              attributes: {
                email: email.trim()
              }
            }
          }),
        });
      }

      // Subscribe to newsletter with email consent
      await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
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
                      email: email.trim(),
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
                  id: newsletterListId
                }
              }
            }
          }
        }),
      });
      console.log('Added to newsletter list');
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
