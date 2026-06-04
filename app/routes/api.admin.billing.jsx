import { redirect } from "react-router";
import {
  authenticate,
  BILLING_STARTER,
  BILLING_GROWTH,
  BILLING_PREMIUM,
} from "../shopify.server";
import { PLANS } from "../services/billing.server";
import db from "../db.server";

export const loader = async () => {
  return redirect("/app");
};

export const action = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const targetPlan = formData.get("plan"); // STARTER, GROWTH, PREMIUM, FREE

  if (targetPlan === PLANS.FREE) {
    // Downgrade to FREE: Cancel current subscription in the database
    // Usually Shopify will stop charging when there's no active subscription,
    // and we update database to FREE.
    await db.shopSettings.upsert({
      where: { shop },
      update: { plan: PLANS.FREE, status: "CANCELLED" },
      create: { shop, plan: PLANS.FREE, status: "CANCELLED" },
    });

    // Clean up any configurations that are using premium designs
    // (Relock locked designs by setting their isActive status to false)
    const activeConfigs = await db.announcementConfig.findMany({
      where: { shop, isActive: true },
    });

    for (const config of activeConfigs) {
      if (config.designType !== "FREE") {
        await db.announcementConfig.update({
          where: { id: config.id },
          data: { isActive: false },
        });
      }
    }

    return Response.json({ redirectUrl: "/app?plan_cancelled=true" });
  }

  let planName;
  if (targetPlan === PLANS.STARTER) {
    planName = BILLING_STARTER;
  } else if (targetPlan === PLANS.GROWTH) {
    planName = BILLING_GROWTH;
  } else if (targetPlan === PLANS.PREMIUM) {
    planName = BILLING_PREMIUM;
  } else {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  const shopName = shop.replace(".myshopify.com", "");
  const returnUrl = `https://admin.shopify.com/store/${shopName}/apps/${process.env.SHOPIFY_API_KEY}/app/billing-return?plan=${targetPlan}`;

  try {
    await billing.request({
      plan: planName,
      isTest: true,
      returnUrl,
    });
    return Response.json({ success: true });
  } catch (error) {
    // Remix throws Response objects to handle redirects. We catch them to extract confirmation URL!
    if (error instanceof Response) {
      const redirectUrl = error.headers.get("location") || error.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url");
      if (redirectUrl) {
        return Response.json({ redirectUrl });
      }
      throw error;
    }
    
    console.error("Error creating billing subscription charge:", error);
    let errorMessage = error.message;
    if (error.errorData) {
      errorMessage += " | Details: " + JSON.stringify(error.errorData);
    }
    return Response.json({ error: errorMessage }, { status: 500 });
  }
};
