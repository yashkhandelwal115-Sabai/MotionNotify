import { redirect } from "react-router";
import {
  authenticate,
  BILLING_STARTER,
  BILLING_GROWTH,
  BILLING_PREMIUM,
} from "../shopify.server";
import { PLANS, relockDesignsForPlan } from "../services/billing.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const requestedPlan = url.searchParams.get("plan");
  const chargeId = url.searchParams.get("charge_id");
  const shopParam = url.searchParams.get("shop");
  const hostParam = url.searchParams.get("host");

  console.log(`[Billing Return] Handling return for shop: ${shop}`);
  console.log(`[Billing Return] Requested Plan: ${requestedPlan}`);
  console.log(`[Billing Return] Charge ID: ${chargeId}`);
  console.log(`[Billing Return] Session validated for shop: ${session.shop}`);

  try {
    // Check if there's any active subscription on the shop
    const checkResult = await billing.check({
      plans: [BILLING_STARTER, BILLING_GROWTH, BILLING_PREMIUM],
      isTest: true,
    });

    if (checkResult.hasActivePayment) {
      // Find the subscription detail
      const activeSubscription = checkResult.appSubscriptions[0];
      let finalPlan = PLANS.FREE;

      if (activeSubscription) {
        const name = activeSubscription.name;
        if (name === BILLING_STARTER) finalPlan = PLANS.STARTER;
        else if (name === BILLING_GROWTH) finalPlan = PLANS.GROWTH;
        else if (name === BILLING_PREMIUM) finalPlan = PLANS.PREMIUM;
        
        console.log(`[Billing Return] Found active subscription: ${name}, mapped to ${finalPlan}`);
      }

      await db.shopSettings.upsert({
        where: { shop },
        update: { plan: finalPlan, status: "ACTIVE" },
        create: { shop, plan: finalPlan, status: "ACTIVE" },
      });

      console.log(`[Billing Return] Updated database with active plan: ${finalPlan}`);

      // Relock designs if plan was downgraded
      await relockDesignsForPlan(shop, finalPlan);

      console.log(`[Billing Return] Redirecting to embedded app dashboard: /app?plan_activated=true&plan=${finalPlan}`);
      return redirect(`/app?plan_activated=true&plan=${finalPlan}&shop=${shopParam}&host=${hostParam}`);
    } else {
      // No active payment was completed
      console.log(`[Billing Return] No active payment found. Redirecting to app dashboard with error.`);
      return redirect(`/app?error=billing_not_completed&shop=${shopParam}&host=${hostParam}`);
    }
  } catch (error) {
    console.error("[Billing Return] Error in billing return handler:", error);
    return redirect(`/app?error=billing_check_failed&message=${encodeURIComponent(error.message)}&shop=${shopParam}&host=${hostParam}`);
  }
};
