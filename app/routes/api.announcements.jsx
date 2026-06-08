// Removed json import
import db from "../db.server";

const inventoryCache = new Map();

export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    const country = url.searchParams.get("country")?.toUpperCase() || "";
    const device = url.searchParams.get("device") || "desktop";

    if (!shop) {
      console.error("[Storefront] Missing shop parameter in API request");
      return Response.json({ error: "Missing shop parameter" }, { 
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" } 
      });
    }

    console.log(`[Storefront] Fetching active campaigns for: ${shop} (device: ${device}, country: ${country || 'N/A'})`);

    // Fetch all active configurations for this shop
    const activeConfigs = await db.announcementConfig.findMany({
      where: {
        shop,
        isActive: true,
      },
      orderBy: [
        { priority: "desc" },
        { updatedAt: "desc" }
      ],
    });

    const now = new Date();

    // Filter based on scheduling, device visibility, and country targeting
    const qualifiedConfigs = activeConfigs.filter((config) => {
      // 1. Device filter
      if (device === "mobile" && !config.mobileVisible) return false;
      if (device === "desktop" && !config.desktopVisible) return false;

      // 2. Scheduling filter
      if (config.scheduledStart) {
        const startDate = new Date(config.scheduledStart);
        if (isNaN(startDate.getTime()) || startDate > now) return false;
      }
      if (config.scheduledEnd) {
        const endDate = new Date(config.scheduledEnd);
        if (isNaN(endDate.getTime()) || endDate < now) return false;
      }

      // 3. Country targeting
      if (config.targetCountries) {
        const allowedCountries = config.targetCountries
          .split(",")
          .map((c) => c.trim().toUpperCase());
        if (allowedCountries.length > 0 && country && !allowedCountries.includes(country)) {
          return false;
        }
      }

      return true;
    });

    // Return the highest-priority qualifying configuration
    const activeCampaign = qualifiedConfigs[0] || null;

    if (activeCampaign && activeCampaign.targetVariantId) {
      try {
        const cacheKey = `${shop}_${activeCampaign.targetVariantId}`;
        const nowMs = Date.now();
        const cached = inventoryCache.get(cacheKey);

        if (cached && nowMs - cached.timestamp < 60000) {
          // Use cached data
          Object.assign(activeCampaign, cached.data);
        } else {
          // Fetch fresh data
          const { unauthenticated } = await import("../shopify.server");
          const { admin } = await unauthenticated.admin(shop);
          
          const response = await admin.graphql(
            `#graphql
            query getVariantData($id: ID!) {
              node(id: $id) {
                ... on ProductVariant {
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
                }
              }
            }`,
            { variables: { id: activeCampaign.targetVariantId } }
          );

          const responseJson = await response.json();
          const variantNode = responseJson.data?.node;

          if (variantNode) {
            let totalInventory = 0;
            let hasInventoryData = false;
            if (variantNode.inventoryItem?.inventoryLevels?.nodes) {
              hasInventoryData = true;
              for (const level of variantNode.inventoryItem.inventoryLevels.nodes) {
                if (level.quantities && level.quantities.length > 0) {
                  totalInventory += level.quantities[0].quantity || 0;
                }
              }
            }

            const fetchedData = {
              targetInventory: variantNode.inventoryItem?.tracked ? totalInventory : null,
              targetPrice: variantNode.price,
              targetCompareAtPrice: variantNode.compareAtPrice || null
            };
            
            inventoryCache.set(cacheKey, { data: fetchedData, timestamp: nowMs });
            Object.assign(activeCampaign, fetchedData);
          } else {
            // Variant not found or deleted
            Object.assign(activeCampaign, { isTargetDeleted: true });
          }
        }
      } catch (err) {
        console.error("[Storefront] Error fetching live variant data via Admin API:", err);
        // Suppress error and let the campaign render with fallback
      }
    }

    return Response.json(
      { campaign: activeCampaign },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "public, max-age=15",
        },
      }
    );
  } catch (error) {
    console.error("[Storefront] Error fetching active campaigns:", error);
    return Response.json({ error: "Internal Server Error", details: error.message }, { 
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" } 
    });
  }
};

export const action = async () => {
  return Response.json({}, { status: 405 });
};
