import prisma from "../db.server";
import { PLANS } from "../utils/billing";

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
