import prisma from "../db.server";
import { PLANS, getDesignsToRelock } from "../utils/billing";

export * from "../utils/billing";

export async function getShopSettings(shop) {
  let settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.shopSettings.create({
      data: {
        shop,
        plan: PLANS.FREE,
        status: "ACTIVE",
      },
    });
  }

  return settings;
}

export async function updateShopPlan(shop, plan) {
  return prisma.shopSettings.upsert({
    where: { shop },
    update: { plan, status: "ACTIVE" },
    create: { shop, plan, status: "ACTIVE" },
  });
}

export async function relockDesignsForPlan(shop, newPlan) {
  const designsToRelock = getDesignsToRelock(newPlan);
  
  if (designsToRelock.length === 0) return;

  // Find active configurations that use designs that should now be locked
  const activeConfigsToLock = await prisma.announcementConfig.findMany({
    where: {
      shop,
      isActive: true,
      designType: {
        in: designsToRelock,
      },
    },
  });

  // Deactivate them
  for (const config of activeConfigsToLock) {
    await prisma.announcementConfig.update({
      where: { id: config.id },
      data: { isActive: false },
    });
    console.log(`Relocked design ${config.designType} for config ${config.id} (shop: ${shop}) after downgrade to ${newPlan}`);
  }
}
