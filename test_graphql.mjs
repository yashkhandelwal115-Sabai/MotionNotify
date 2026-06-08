import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import prisma from './app/db.server.js';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const shop = 'foot-store-yash.myshopify.com';
  const session = await prisma.session.findFirst({
    where: { shop },
  });

  if (!session) {
    console.error("No session found for shop");
    process.exit(1);
  }

  const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    apiVersion: ApiVersion.October25,
    scopes: process.env.SCOPES?.split(","),
    isEmbeddedApp: true,
    hostName: 'localhost',
  });

  const client = new shopify.clients.Graphql({ session });

  // Get a variant ID first
  const products = await client.request(
    `{ products(first: 1) { nodes { variants(first: 1) { nodes { id } } } } }`
  );
  
  const variantId = products.data.products.nodes[0].variants.nodes[0].id;
  console.log("Testing with variant ID:", variantId);

  try {
    const res = await client.request(
      `query getVariantInfo($id: ID!) {
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
            image {
              url
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
      }`,
      { variables: { id: variantId } }
    );
    console.log("Success:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("GRAPHQL ERROR:", err.message);
    if (err.response) console.error(JSON.stringify(err.response, null, 2));
  }
}

run().catch(console.error);
