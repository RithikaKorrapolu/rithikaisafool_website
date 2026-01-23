import Client from 'shopify-buy';

const client = Client.buildClient({
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
  apiVersion: '2024-01',
});

export async function getProducts() {
  try {
    const query = `
      {
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              handle
              tags
              images(first: 10) {
                edges {
                  node {
                    src
                    altText
                  }
                }
              }
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                    quantityAvailable
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();

    // Transform GraphQL response to match the expected format
    const products = data.data.products.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      description: edge.node.description,
      handle: edge.node.handle,
      tags: edge.node.tags,
      images: edge.node.images.edges.map((img: any) => ({
        src: img.node.src,
        altText: img.node.altText,
      })),
      variants: edge.node.variants.edges.map((variant: any) => ({
        id: variant.node.id,
        title: variant.node.title,
        price: variant.node.price,
        available: variant.node.availableForSale,
        quantityAvailable: variant.node.quantityAvailable,
      })),
    }));

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProduct(productId: string) {
  try {
    const product = await client.product.fetch(productId);
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getProductByHandle(handle: string) {
  try {
    const query = `
      {
        productByHandle(handle: "${handle}") {
          id
          title
          description
          handle
          tags
          images(first: 10) {
            edges {
              node {
                src
                altText
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
              }
            }
          }
          sellingPlanGroups(first: 10) {
            edges {
              node {
                name
                sellingPlans(first: 10) {
                  edges {
                    node {
                      id
                      name
                      description
                      priceAdjustments {
                        adjustmentValue {
                          ... on SellingPlanFixedAmountPriceAdjustment {
                            adjustmentAmount {
                              amount
                              currencyCode
                            }
                          }
                          ... on SellingPlanFixedPriceAdjustment {
                            price {
                              amount
                              currencyCode
                            }
                          }
                          ... on SellingPlanPercentagePriceAdjustment {
                            adjustmentPercentage
                          }
                        }
                        orderCount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();

    // Log any GraphQL errors
    if (data.errors) {
      console.error('GraphQL errors:', JSON.stringify(data.errors, null, 2));
    }

    if (!data.data?.productByHandle) {
      console.error('No product found for handle, full response:', JSON.stringify(data, null, 2));
      return null;
    }

    const productData = data.data.productByHandle;
    const product = {
      id: productData.id,
      title: productData.title,
      description: productData.description,
      handle: productData.handle,
      tags: productData.tags,
      images: productData.images.edges.map((img: any) => ({
        src: img.node.src,
        altText: img.node.altText,
      })),
      variants: productData.variants.edges.map((variant: any) => ({
        id: variant.node.id,
        title: variant.node.title,
        price: variant.node.price,
        available: variant.node.availableForSale,
        quantityAvailable: variant.node.quantityAvailable,
      })),
      sellingPlanGroups: productData.sellingPlanGroups?.edges?.map((group: any) => ({
        name: group.node.name,
        sellingPlans: group.node.sellingPlans.edges.map((plan: any) => ({
          id: plan.node.id,
          name: plan.node.name,
          description: plan.node.description,
          priceAdjustments: plan.node.priceAdjustments,
        })),
      })) || [],
    };

    return product;
  } catch (error) {
    console.error('Error fetching product by handle:', error);
    return null;
  }
}

export { client };
