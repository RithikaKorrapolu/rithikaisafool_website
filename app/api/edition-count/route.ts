import { NextResponse } from 'next/server';

const SHOPIFY_ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

// Get the current edition count
export async function GET() {
  try {
    // Get the stranger hoodie product by handle
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?handle=a-stranger-designed-my-hoodie`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN!,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    const product = data.products?.[0];

    if (!product) {
      return NextResponse.json({ editionCount: 1 });
    }

    // Get metafields for this product
    const metafieldsResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${product.id}/metafields.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN!,
          'Content-Type': 'application/json',
        },
      }
    );

    const metafieldsData = await metafieldsResponse.json();
    const editionMetafield = metafieldsData.metafields?.find(
      (mf: any) => mf.namespace === 'custom' && mf.key === 'edition_count'
    );

    const editionCount = editionMetafield ? parseInt(editionMetafield.value) : 1;

    return NextResponse.json({ editionCount });
  } catch (error) {
    console.error('Error fetching edition count:', error);
    return NextResponse.json({ editionCount: 1 });
  }
}

// Increment the edition count
export async function POST() {
  try {
    // Get the stranger hoodie product by handle
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?handle=a-stranger-designed-my-hoodie`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN!,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    const product = data.products?.[0];

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get current metafields
    const metafieldsResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${product.id}/metafields.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN!,
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
      // Update existing metafield
      await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${product.id}/metafields/${editionMetafield.id}.json`,
        {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN!,
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
      // Create new metafield
      await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${product.id}/metafields.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN!,
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

    return NextResponse.json({ editionCount: newCount });
  } catch (error) {
    console.error('Error incrementing edition count:', error);
    return NextResponse.json({ error: 'Failed to increment' }, { status: 500 });
  }
}
