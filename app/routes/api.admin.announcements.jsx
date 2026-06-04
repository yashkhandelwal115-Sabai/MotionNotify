// Removed json import
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getShopSettings, isDesignUnlocked } from "../services/billing.server";

// Loader: Fetch all configurations and current plan settings for the shop
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const [configs, settings] = await Promise.all([
    db.announcementConfig.findMany({
      where: { shop },
      orderBy: { updatedAt: "desc" },
    }),
    getShopSettings(shop),
  ]);

  return Response.json({ configs, settings });
};

// Action: Create, Update, or Delete configurations
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const actionType = url.searchParams.get("action") || "save";

  if (actionType === "delete") {
    const formData = await request.formData();
    const id = formData.get("id");

    if (!id) {
      return Response.json({ error: "Missing config ID" }, { status: 400 });
    }

    await db.announcementConfig.delete({
      where: { id, shop },
    });

    return Response.json({ success: true });
  }

  // Save / Update config
  const payload = await request.json();
  const {
    id,
    name,
    designType,
    isActive,
    text,
    heading,
    subheading,
    fontColor,
    bgColor,
    gradientColor1,
    gradientColor2,
    buttonText,
    buttonUrl,
    buttonStyle,
    countdownDate,
    cards,
    borderRadius,
    animationEnabled,
    mobileVisible,
    desktopVisible,
    rotationTiming,
    badgeLabel,
    icon,
    scheduledStart,
    scheduledEnd,
    targetCountries,
    priority,
  } = payload;

  // Enforce Plan Limits
  const shopSettings = await getShopSettings(shop);
  const activePlan = shopSettings.plan;

  if (!isDesignUnlocked(activePlan, designType)) {
    return Response.json(
      {
        error: `Design '${designType}' is locked on your current plan (${activePlan}). Please upgrade to unlock it.`,
      },
      { status: 403 }
    );
  }

  // If this config is being activated, optionally deactivate others if we want single-active
  // For standard behavior, let's keep multiple campaigns active but respect priority and scheduling.
  if (isActive && id) {
    // If saving/activating, verify no scheduling conflicts or let prioritizer handle it.
  }

  const configData = {
    shop,
    name: name || "Announcement Campaign",
    designType: designType || "FREE",
    isActive: isActive !== undefined ? isActive : false,
    text: text || "",
    heading: heading || "",
    subheading: subheading || "",
    fontColor: fontColor || "#FFFFFF",
    bgColor: bgColor || "#000000",
    gradientColor1: gradientColor1 || "#ff7e5f",
    gradientColor2: gradientColor2 || "#feb47b",
    buttonText: buttonText || "",
    buttonUrl: buttonUrl || "",
    buttonStyle: buttonStyle || "solid",
    countdownDate: countdownDate || "",
    cards: typeof cards === "string" ? cards : JSON.stringify(cards || []),
    borderRadius: borderRadius !== undefined ? Number(borderRadius) : 8,
    animationEnabled: animationEnabled !== undefined ? animationEnabled : true,
    mobileVisible: mobileVisible !== undefined ? mobileVisible : true,
    desktopVisible: desktopVisible !== undefined ? desktopVisible : true,
    rotationTiming: rotationTiming !== undefined ? Number(rotationTiming) : 5,
    badgeLabel: badgeLabel || "",
    icon: icon || "",
    scheduledStart: scheduledStart || "",
    scheduledEnd: scheduledEnd || "",
    targetCountries: targetCountries || "",
    priority: priority !== undefined ? Number(priority) : 0,
  };

  let savedConfig;
  if (id) {
    // Update
    savedConfig = await db.announcementConfig.update({
      where: { id, shop },
      data: configData,
    });
  } else {
    // Create new
    savedConfig = await db.announcementConfig.create({
      data: configData,
    });
  }

  return Response.json({ success: true, config: savedConfig });
};
