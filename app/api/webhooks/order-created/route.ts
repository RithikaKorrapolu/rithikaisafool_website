import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY || '';
const CCP_SUBSCRIPTION_LIST_ID = 'VhUSZw';
const MAIN_NEWSLETTER_LIST_ID = 'RSaqUR';
const STRANGER_SWEATSHIRT_LIST_ID = 'VHc2sZ';

// Verify webhook is from Shopify
function verifyWebhook(body: string, hmacHeader: string): boolean {
  const hash = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');
  return hash === hmacHeader;
}

// Track Stranger Sweatshirt purchase event in Klaviyo
async function trackStrangerPurchaseEvent(
  email: string,
  firstName: string,
  editionNumber: number,
  size: string,
  orderId: string
) {
  if (!KLAVIYO_API_KEY || !email) {
    console.error('Missing Klaviyo API key or email for stranger purchase event');
    return;
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-10-15',
      },
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            metric: {
              data: {
                type: 'metric',
                attributes: {
                  name: 'Stranger Sweatshirt Purchased'
                }
              }
            },
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email: email,
                  first_name: firstName || undefined
                }
              }
            },
            properties: {
              edition_number: editionNumber,
              size: size,
              order_id: orderId,
              product_name: 'A Stranger Designed My Sweatshirt'
            },
            time: new Date().toISOString()
          }
        }
      }),
    });

    if (response.ok) {
      console.log(`Successfully tracked Stranger Sweatshirt purchase event for ${email}`);
    } else {
      const errorText = await response.text();
      console.error('Failed to track Klaviyo event:', response.status, errorText);
    }
  } catch (error) {
    console.error('Klaviyo event tracking error:', error);
  }
}

// Subscribe email to Klaviyo list
async function subscribeToKlaviyoList(email: string, listId: string) {
  if (!KLAVIYO_API_KEY || !email) {
    console.error('Missing Klaviyo API key or email');
    return;
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
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

    if (response.ok || response.status === 409) {
      console.log(`Successfully subscribed ${email} to Klaviyo list ${listId}`);
    } else {
      console.error('Failed to subscribe to Klaviyo:', response.status);
    }
  } catch (error) {
    console.error('Klaviyo subscription error:', error);
  }
}

// Increment edition count for stranger hoodie
async function incrementEditionCount() {
  // Get the stranger hoodie product
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?handle=a-stranger-designed-my-sweatshirt`,
    {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  const product = data.products?.[0];

  if (!product) {
    throw new Error('Stranger hoodie product not found');
  }

  // Get current metafields
  const metafieldsResponse = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${product.id}/metafields.json`,
    {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    }
  );

  const metafieldsData = await metafieldsResponse.json();
  const editionMetafield = metafieldsData.metafields?.find(
    (mf: any) => mf.namespace === 'custom' && mf.key === 'edition_count'
  );

  const currentCount = editionMetafield ? parseInt(editionMetafield.value) : 1;
  const newCount = currentCount + 1;

  // Update or create the metafield
  if (editionMetafield) {
    await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${product.id}/metafields/${editionMetafield.id}.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metafield: {
            value: newCount.toString(),
          },
        }),
      }
    );
  } else {
    await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${product.id}/metafields.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metafield: {
            namespace: 'custom',
            key: 'edition_count',
            value: newCount.toString(),
            type: 'number_integer',
          },
        }),
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    const body = await request.text();

    // Verify webhook authenticity
    if (!hmacHeader || !verifyWebhook(body, hmacHeader)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const order = JSON.parse(body);
    console.log('Order received:', order.id);

    // Get all line items from the order
    const lineItems = order.line_items || [];

    // Check if order contains the stranger hoodie and increment edition count
    for (const item of lineItems) {
      const productTitle = item.title?.toLowerCase() || '';
      if (productTitle.includes('stranger')) {
        // Get customer info for the email
        const customerEmail = order.email || order.customer?.email;
        const customerFirstName = order.customer?.first_name || order.billing_address?.first_name || '';
        const size = item.variant_title || 'Unknown';

        // Increment edition count for each hoodie purchased
        const quantity = item.quantity || 1;
        for (let i = 0; i < quantity; i++) {
          try {
            await incrementEditionCount();
            console.log('Incremented stranger hoodie edition count');

            // Get the new edition count to include in the email
            const editionResponse = await fetch(
              `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?handle=a-stranger-designed-my-sweatshirt`,
              {
                headers: {
                  'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
                  'Content-Type': 'application/json',
                },
              }
            );
            const editionData = await editionResponse.json();
            const product = editionData.products?.[0];

            if (product && customerEmail) {
              const metafieldsResponse = await fetch(
                `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${product.id}/metafields.json`,
                {
                  headers: {
                    'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
                    'Content-Type': 'application/json',
                  },
                }
              );
              const metafieldsData = await metafieldsResponse.json();
              const editionMetafield = metafieldsData.metafields?.find(
                (mf: any) => mf.namespace === 'custom' && mf.key === 'edition_count'
              );
              const currentEdition = editionMetafield ? parseInt(editionMetafield.value) : 1;

              // Track the purchase event in Klaviyo to trigger the welcome email
              await trackStrangerPurchaseEvent(
                customerEmail,
                customerFirstName,
                currentEdition,
                size,
                order.id?.toString() || ''
              );
              console.log(`Tracked Stranger purchase event for edition #${currentEdition}`);

              // Add buyer to the Stranger Sweatshirt Klaviyo list
              await subscribeToKlaviyoList(customerEmail, STRANGER_SWEATSHIRT_LIST_ID);
              console.log(`Added ${customerEmail} to Stranger Sweatshirt list`);
            }
          } catch (err) {
            console.error('Failed to increment edition count:', err);
          }
        }
      }

      // Check if order contains Let Me Show You subscription
      const isLMSYProduct = productTitle.includes('let me show you');
      console.log('Checking product:', productTitle, 'Is LMSY:', isLMSYProduct);

      if (isLMSYProduct) {
        const customerEmail = order.email || order.customer?.email;
        console.log('LMSY product found, customer email:', customerEmail);
        if (customerEmail) {
          try {
            await subscribeToKlaviyoList(customerEmail, CCP_SUBSCRIPTION_LIST_ID);
            await subscribeToKlaviyoList(customerEmail, MAIN_NEWSLETTER_LIST_ID);
            console.log('Subscribed LMSY buyer to Klaviyo lists');
          } catch (err) {
            console.error('Failed to subscribe LMSY buyer:', err);
          }
        }
      }
    }

    // For each product purchased, check if it's a monthly-limited product
    for (const item of lineItems) {
      const productId = item.product_id;
      const purchasedVariantId = item.variant_id;

      if (!productId || !purchasedVariantId) continue;

      // Fetch product details to check for "monthly-limited" tag
      const productResponse = await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${productId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!productResponse.ok) {
        console.error('Failed to fetch product:', productResponse.statusText);
        continue;
      }

      const productData = await productResponse.json();
      const product = productData.product;
      const tags = product?.tags || '';

      // Only apply inventory zeroing for products tagged with "monthly-limited"
      if (!tags.includes('monthly-limited')) {
        console.log(`Product ${productId} is not monthly-limited, skipping inventory update`);
        continue;
      }

      const variants = product?.variants || [];

      // Zero out inventory for all OTHER variants of this monthly-limited product
      for (const variant of variants) {
        if (variant.id.toString() === purchasedVariantId.toString()) {
          continue; // Skip the purchased variant
        }

        // Get inventory item ID
        const inventoryItemId = variant.inventory_item_id;

        if (!inventoryItemId) continue;

        // Get inventory levels for this item
        const inventoryResponse = await fetch(
          `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/inventory_levels.json?inventory_item_ids=${inventoryItemId}`,
          {
            headers: {
              'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
            },
          }
        );

        if (!inventoryResponse.ok) {
          console.error('Failed to fetch inventory levels');
          continue;
        }

        const inventoryData = await inventoryResponse.json();
        const inventoryLevel = inventoryData.inventory_levels?.[0];

        if (!inventoryLevel) continue;

        // Set inventory to 0
        await fetch(
          `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/inventory_levels/set.json`,
          {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              location_id: inventoryLevel.location_id,
              inventory_item_id: inventoryItemId,
              available: 0,
            }),
          }
        );

        console.log(`Zeroed out variant ${variant.id} inventory`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
