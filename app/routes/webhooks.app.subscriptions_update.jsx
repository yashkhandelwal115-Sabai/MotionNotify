import { authenticate } from "../shopify.server";
import db from "../db.server";
import { PLANS } from "../services/billing.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (payload && payload.app_subscription) {
    const subscription = payload.app_subscription;
    const status = subscription.status;
    const name = subscription.name;

    let targetPlan = PLANS.FREE;

    if (status === "ACTIVE") {
      if (name.includes("Starter")) {
        targetPlan = PLANS.STARTER;
      } else if (name.includes("Growth")) {
        targetPlan = PLANS.GROWTH;
      } else if (name.includes("Premium")) {
        targetPlan = PLANS.PREMIUM;
      }
    }

    await db.shopSettings.upsert({
      where: { shop },
      update: { plan: targetPlan, status: status },
      create: { shop, plan: targetPlan, status: status },
    });
    
    console.log(`Updated shop ${shop} plan to ${targetPlan} (status: ${status})`);
  }

  return new Response();
};
