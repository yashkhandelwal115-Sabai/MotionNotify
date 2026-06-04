// Removed json import
import db from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const country = url.searchParams.get("country")?.toUpperCase() || "";
  const device = url.searchParams.get("device") || "desktop";

  if (!shop) {
    return Response.json({ error: "Missing shop parameter" }, { 
      status: 400,
      headers: { "Access-Control-Allow-Origin": "*" } 
    });
  }

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
};

export const action = async () => {
  return Response.json({}, { status: 405 });
};
