import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const variantId = url.searchParams.get("variantId");

  if (!variantId) {
    return Response.json({ error: "Missing variantId" }, { status: 400 });
  }

  console.log(`[API:VariantInfo] Fetching variant info for ID: ${variantId}`);

  try {
    const query = `#graphql
      query getVariantInfo($id: ID!) {
        node(id: $id) {
          ... on ProductVariant {
            id
            title
            price
            compareAtPrice
            inventoryItem {
              tracked
              inventoryLevels(first: 10) {
                nodes {
                  quantities(names: ["available"]) {
                    quantity
                  }
                }
              }
            }
            product {
              id
              title
              featuredImage {
                url
              }
            }
          }
        }
      }`;

    console.log(`[API:VariantInfo] Executing GraphQL Query with variables: ${JSON.stringify({ id: variantId })}`);
    const response = await admin.graphql(query, { variables: { id: variantId } });

    const responseJson = await response.json();
    console.log(`[API:VariantInfo] GraphQL Response:`, JSON.stringify(responseJson, null, 2));

    const node = responseJson.data?.node;

    if (!node) {
      return Response.json({ error: "Variant not found" }, { status: 404 });
    }

    // Calculate total available inventory across all levels
    let totalInventory = 0;
    if (node.inventoryItem?.inventoryLevels?.nodes) {
      for (const level of node.inventoryItem.inventoryLevels.nodes) {
        if (level.quantities && level.quantities.length > 0) {
          totalInventory += level.quantities[0].quantity || 0;
        }
      }
    }

    return Response.json({
      variantId: node.id,
      variantTitle: node.title,
      price: node.price,
      compareAtPrice: node.compareAtPrice,
      inventoryQuantity: node.inventoryItem?.tracked ? totalInventory : null,
      inventoryTracked: !!node.inventoryItem?.tracked,
      imageUrl: node.image?.url || node.product?.featuredImage?.url || null,
      productId: node.product?.id,
      productTitle: node.product?.title,
    });
  } catch (err) {
    console.error(`[API:VariantInfo] Caught Error fetching variant info:`, err.message);
    if (err.response) {
      console.error(`[API:VariantInfo] Shopify GraphQL Error Response:`, JSON.stringify(err.response, null, 2));
    } else {
      console.error(`[API:VariantInfo] Full error stack:`, err.stack || err);
    }
    return Response.json({ error: "Failed to fetch variant info", details: err.message || String(err) }, { status: 500 });
  }
};
