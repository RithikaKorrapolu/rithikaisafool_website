import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';

// Verify webhook is from Shopify
function verifyWebhook(body: string, hmacHeader: string): boolean {
  const hash = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');
  return hash === hmacHeader;
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

    // For each product purchased, zero out all other variants
    for (const item of lineItems) {
      const productId = item.product_id;
      const purchasedVariantId = item.variant_id;

      if (!productId || !purchasedVariantId) continue;

      // Fetch all variants for this product
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
      const variants = productData.product?.variants || [];

      // Zero out inventory for all OTHER variants
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
