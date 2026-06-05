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

// Action: Create, Update, Delete, or Toggle configurations
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const actionType = url.searchParams.get("action") || "save";

  // ─── TOGGLE: Lean activation/deactivation with single-active enforcement ───
  if (actionType === "toggle") {
    try {
      const payload = await request.json();
      const { id, isActive } = payload;

      if (!id) {
        console.error("[API][Toggle] Missing campaign ID", { shop });
        return Response.json({ error: "Missing campaign ID" }, { status: 400 });
      }

      console.log(`[API][Toggle] Request — campaign: ${id}, target isActive: ${isActive}, shop: ${shop}`);

      // Verify the campaign exists and belongs to this shop
      const existing = await db.announcementConfig.findUnique({
        where: { id },
      });

      if (!existing || existing.shop !== shop) {
        console.error(`[API][Toggle] Campaign not found: ${id}, shop: ${shop}`);
        return Response.json({ error: "Campaign not found" }, { status: 404 });
      }

      let updatedConfig;

      if (isActive) {
        // SINGLE-ACTIVE ENFORCEMENT: Deactivate all other campaigns, then activate this one
        // Uses Prisma $transaction for atomicity
        const [, activated] = await db.$transaction([
          // Step 1: Pause all other active campaigns for this shop
          db.announcementConfig.updateMany({
            where: {
              shop,
              id: { not: id },
              isActive: true,
            },
            data: { isActive: false },
          }),
          // Step 2: Activate the target campaign
          db.announcementConfig.update({
            where: { id, shop },
            data: { isActive: true },
          }),
        ]);

        updatedConfig = activated;
        console.log(`[API][Toggle] Campaign ACTIVATED: ${id} (${existing.name}). All other campaigns paused. Shop: ${shop}`);
      } else {
        // Simple deactivation — no need to touch other campaigns
        updatedConfig = await db.announcementConfig.update({
          where: { id, shop },
          data: { isActive: false },
        });
        console.log(`[API][Toggle] Campaign PAUSED: ${id} (${existing.name}). Shop: ${shop}`);
      }

      return Response.json({
        success: true,
        config: updatedConfig,
        action: isActive ? "activated" : "paused",
      });
    } catch (error) {
      console.error(`[API][Toggle] Error toggling campaign:`, error);
      return Response.json(
        { error: `Failed to toggle campaign: ${error.message}` },
        { status: 500 }
      );
    }
  }

  // ─── DELETE ───
  if (actionType === "delete") {
    try {
      const formData = await request.formData();
      const id = formData.get("id");

      if (!id) {
        return Response.json({ error: "Missing config ID" }, { status: 400 });
      }

      await db.announcementConfig.delete({
        where: { id, shop },
      });

      console.log(`[API][Delete] Campaign deleted: ${id}, shop: ${shop}`);
      return Response.json({ success: true });
    } catch (error) {
      console.error(`[API][Delete] Error deleting campaign:`, error);
      return Response.json(
        { error: `Failed to delete campaign: ${error.message}` },
        { status: 500 }
      );
    }
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

  // Single-active enforcement: if saving with isActive=true, pause all others
  if (isActive && id) {
    await db.announcementConfig.updateMany({
      where: {
        shop,
        id: { not: id },
        isActive: true,
      },
      data: { isActive: false },
    });
    console.log(`[API][Save] Single-active enforcement: paused other campaigns for shop: ${shop}`);
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

  console.log(`[API][Save] Campaign saved: ${savedConfig.id} (${savedConfig.name}), isActive: ${savedConfig.isActive}, shop: ${shop}`);
  return Response.json({ success: true, config: savedConfig });
};
