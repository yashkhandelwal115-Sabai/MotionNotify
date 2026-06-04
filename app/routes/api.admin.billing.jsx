import { redirect } from "react-router";
import {
  authenticate,
  BILLING_STARTER,
  BILLING_GROWTH,
  BILLING_PREMIUM,
} from "../shopify.server";
import { PLANS, relockDesignsForPlan } from "../services/billing.server";
import { isPlanUpgrade } from "../utils/billing";
import db from "../db.server";

export const loader = async () => {
  return redirect("/app");
};


export const action = async ({ request }) => {
  const { session, billing, admin } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const targetPlan = formData.get("plan");

  console.log(`[Billing] Shop ${shop} requested plan change to: ${targetPlan}`);

  // Determine current active plan from Shopify
  let currentPlan = PLANS.FREE;
  let currentSubscription = null;
  
  const checkResult = await billing.check({
    plans: [BILLING_STARTER, BILLING_GROWTH, BILLING_PREMIUM],
    isTest: true,
  });

  if (checkResult.hasActivePayment) {
    currentSubscription = checkResult.activeSubscriptions[0];
    const name = currentSubscription.name;
    if (name === BILLING_STARTER) currentPlan = PLANS.STARTER;
    else if (name === BILLING_GROWTH) currentPlan = PLANS.GROWTH;
    else if (name === BILLING_PREMIUM) currentPlan = PLANS.PREMIUM;
  }

  console.log(`[Billing] Current active plan is ${currentPlan}`);

  if (targetPlan === PLANS.FREE) {
    console.log(`[Billing] Action: Downgrading to FREE for ${shop}`);
    
    // Downgrade to FREE: Cancel current subscription via GraphQL if it exists
    if (currentSubscription) {
      await admin.graphql(
        `#graphql
        mutation appSubscriptionCancel($id: ID!) {
          appSubscriptionCancel(id: $id) {
            appSubscription {
              id
              status
            }
            userErrors {
              field
              message
            }
          }
        }`,
        { variables: { id: currentSubscription.id } }
      );
      console.log(`[Billing] Successfully cancelled subscription ${currentSubscription.id}`);
    }

    // Update database
    await db.shopSettings.upsert({
      where: { shop },
      update: { plan: PLANS.FREE, status: "CANCELLED" },
      create: { shop, plan: PLANS.FREE, status: "CANCELLED" },
    });

    // Relock premium designs
    await relockDesignsForPlan(shop, PLANS.FREE);

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

  const isUpgrade = isPlanUpgrade(currentPlan, targetPlan);
  console.log(`[Billing] Action: ${isUpgrade ? "Upgrading" : "Downgrading"} from ${currentPlan} to ${targetPlan}`);

  // If downgrading to a paid plan, cancel the current subscription first
  if (!isUpgrade && currentSubscription) {
    console.log(`[Billing] Cancelling current subscription ${currentSubscription.id} before downgrade...`);
    await admin.graphql(
      `#graphql
      mutation appSubscriptionCancel($id: ID!) {
        appSubscriptionCancel(id: $id) {
          appSubscription {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }`,
      { variables: { id: currentSubscription.id } }
    );
  }

  const shopName = shop.replace(".myshopify.com", "");
  const returnUrl = `https://admin.shopify.com/store/${shopName}/apps/${process.env.SHOPIFY_API_KEY}/app/billing-return?plan=${targetPlan}&shop=${shop}`;

  try {
    console.log(`[Billing] Requesting new subscription for ${planName}...`);
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
        console.log(`[Billing] Received redirect URL to Shopify billing confirmation`);
        return Response.json({ redirectUrl });
      }
      throw error;
    }
    
    console.error("[Billing] Error creating billing subscription charge:", error);
    let errorMessage = error.message;
    if (error.errorData) {
      errorMessage += " | Details: " + JSON.stringify(error.errorData);
    }
    return Response.json({ error: errorMessage }, { status: 500 });
  }
};
