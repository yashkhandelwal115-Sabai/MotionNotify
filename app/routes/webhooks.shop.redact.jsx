import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}. Redacting shop data.`);

  try {
    await db.analyticsEvent.deleteMany({ where: { shop } });
    await db.announcementConfig.deleteMany({ where: { shop } });
    await db.shopSettings.deleteMany({ where: { shop } });
    console.log(`Successfully redacted data for shop ${shop}`);
  } catch (error) {
    console.error(`Error redacting data for shop ${shop}:`, error);
  }

  return new Response();
};
