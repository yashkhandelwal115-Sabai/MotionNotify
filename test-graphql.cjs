const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.session.findMany();
  if (sessions.length > 0) {
    const session = sessions[0]; // Just grab the first session for debugging
    console.log("Shop:", session.shop);
    console.log("AccessToken:", session.accessToken);
    
    // Now let's try a direct query
    const query = `
      query {
        products(first: 1) {
          edges {
            node {
              variants(first: 1) {
                edges {
                  node {
                    id
                    inventoryItem {
                      tracked
                      tracksInventory
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    
    const response = await fetch(`https://${session.shop}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': session.accessToken,
      },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    console.log("GraphQL response:", JSON.stringify(data, null, 2));
  } else {
    console.log("No sessions found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
