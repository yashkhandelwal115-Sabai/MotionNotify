// Removed json import
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const range = url.searchParams.get("range") || "30d"; // 7d, 30d, all

  let dateFilter = {};
  if (range === "7d") {
    dateFilter = { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
  } else if (range === "30d") {
    dateFilter = { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
  }

  // Get raw analytics events for this shop
  const events = await db.analyticsEvent.findMany({
    where: {
      shop,
      ...dateFilter,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate totals
  let impressions = 0;
  let clicks = 0;
  let mobileClicks = 0;
  let desktopClicks = 0;
  let mobileImpressions = 0;
  let desktopImpressions = 0;

  const countryStats = {};
  const configStats = {};

  events.forEach((evt) => {
    const isImp = evt.eventType === "IMPRESSION";
    const isClick = evt.eventType === "CLICK";
    const isMobile = evt.eventType === "MOBILE";

    if (isImp) {
      impressions++;
      if (isMobile) mobileImpressions++;
      else desktopImpressions++;
    } else if (isClick) {
      clicks++;
      if (isMobile) mobileClicks++;
      else desktopClicks++;
    }

    // Country stats
    const cCode = evt.country || "UNKNOWN";
    if (!countryStats[cCode]) {
      countryStats[cCode] = { impressions: 0, clicks: 0 };
    }
    if (isImp) countryStats[cCode].impressions++;
    if (isClick) countryStats[cCode].clicks++;

    // Config stats
    const cfgId = evt.configId;
    if (!configStats[cfgId]) {
      configStats[cfgId] = { impressions: 0, clicks: 0 };
    }
    if (isImp) configStats[cfgId].impressions++;
    if (isClick) configStats[cfgId].clicks++;
  });

  // Fetch campaign names to label configuration stats
  const configs = await db.announcementConfig.findMany({
    where: { shop },
    select: { id: true, name: true, designType: true },
  });

  const configMap = {};
  configs.forEach((c) => {
    configMap[c.id] = { name: c.name, type: c.designType };
  });

  const parsedConfigStats = Object.keys(configStats).map((cfgId) => {
    const stats = configStats[cfgId];
    const details = configMap[cfgId] || { name: "Deleted Campaign", type: "UNKNOWN" };
    const ctr = stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : "0.00";
    return {
      id: cfgId,
      name: details.name,
      type: details.type,
      impressions: stats.impressions,
      clicks: stats.clicks,
      ctr: parseFloat(ctr),
    };
  });

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";

  // Device Split
  const totalDeviceActions = impressions + clicks;
  const mobileCount = mobileImpressions + mobileClicks;
  const desktopCount = desktopImpressions + desktopClicks;
  
  const mobilePct = totalDeviceActions > 0 ? Math.round((mobileCount / totalDeviceActions) * 100) : 50;
  const desktopPct = totalDeviceActions > 0 ? Math.round((desktopCount / totalDeviceActions) * 100) : 50;

  // Estimation: Conversion Rate = 2%, Average Order Value = $65
  const estimatedSales = (clicks * 0.02 * 65).toFixed(2);

  // Format Top Countries
  const topCountries = Object.keys(countryStats)
    .map((code) => {
      const stats = countryStats[code];
      const cCtr = stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : "0.00";
      return {
        country: code,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: parseFloat(cCtr),
      };
    })
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  return Response.json({
    summary: {
      impressions,
      clicks,
      ctr: parseFloat(ctr),
      estimatedSales: parseFloat(estimatedSales),
      deviceSplit: { mobile: mobilePct, desktop: desktopPct },
    },
    campaignStats: parsedConfigStats,
    topCountries,
    recentEvents: events.slice(0, 10).map((e) => ({
      id: e.id,
      configName: configMap[e.configId]?.name || "Announcement Bar",
      eventType: e.eventType,
      deviceType: e.deviceType,
      country: e.country,
      createdAt: e.createdAt,
    })),
  });
};
