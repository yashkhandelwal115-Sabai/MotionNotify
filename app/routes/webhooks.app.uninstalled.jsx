import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  // Reset merchant plan to FREE and clear active subscription state
  await db.shopSettings.updateMany({
    where: { shop },
    data: {
      plan: "FREE",
      status: "INACTIVE"
    }
  });

  console.log(`Successfully reset plan to FREE and cleared subscription state for uninstalled shop: ${shop}`);

  return new Response();
};
