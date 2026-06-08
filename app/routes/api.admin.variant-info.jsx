import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const variantId = url.searchParams.get("variantId");

  if (!variantId) {
    return Response.json({ error: "Missing variantId" }, { status: 400 });
  }

  try {
    const response = await admin.graphql(
      `#graphql
      query getVariantInfo($id: ID!) {
        node(id: $id) {
          ... on ProductVariant {
            id
            title
            displayName
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
            image {
              url
            }
            product {
              id
              title
              featuredMedia {
                preview {
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }`,
      { variables: { id: variantId } }
    );

    const responseJson = await response.json();
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
      displayName: node.displayName,
      price: node.price,
      compareAtPrice: node.compareAtPrice,
      inventoryQuantity: node.inventoryItem?.tracked ? totalInventory : null,
      inventoryTracked: !!node.inventoryItem?.tracked,
      imageUrl: node.image?.url || node.product?.featuredMedia?.preview?.image?.url || null,
      productId: node.product?.id,
      productTitle: node.product?.title,
    });
  } catch (err) {
    console.error("[API] Error fetching variant info:", err);
    return Response.json({ error: "Failed to fetch variant info" }, { status: 500 });
  }
};
