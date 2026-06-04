import { redirect } from "react-router";
import {
  authenticate,
  BILLING_STARTER,
  BILLING_GROWTH,
  BILLING_PREMIUM,
} from "../shopify.server";
import { PLANS } from "../services/billing.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const requestedPlan = url.searchParams.get("plan");

  try {
    // Check if there's any active subscription on the shop
    const checkResult = await billing.check({
      plans: [BILLING_STARTER, BILLING_GROWTH, BILLING_PREMIUM],
      isTest: true,
    });

    if (checkResult.hasActivePayment) {
      // Find the subscription detail
      const activeSubscription = checkResult.activeSubscriptions[0];
      let finalPlan = PLANS.FREE;

      if (activeSubscription) {
        const name = activeSubscription.name;
        if (name === BILLING_STARTER) finalPlan = PLANS.STARTER;
        else if (name === BILLING_GROWTH) finalPlan = PLANS.GROWTH;
        else if (name === BILLING_PREMIUM) finalPlan = PLANS.PREMIUM;
      }

      await db.shopSettings.upsert({
        where: { shop },
        update: { plan: finalPlan, status: "ACTIVE" },
        create: { shop, plan: finalPlan, status: "ACTIVE" },
      });

      return redirect(`/app?plan_activated=true&plan=${finalPlan}`);
    } else {
      // No active payment was completed
      return redirect("/app?error=billing_not_completed");
    }
  } catch (error) {
    console.error("Error in billing return handler:", error);
    return redirect(`/app?error=billing_check_failed&message=${encodeURIComponent(error.message)}`);
  }
};
