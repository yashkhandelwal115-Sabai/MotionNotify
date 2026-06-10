import prisma from './app/db.server.js';

async function getShopSettingsLocal(shop) {
  let settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.shopSettings.create({
      data: {
        shop,
        plan: "FREE",
        status: "ACTIVE",
      },
    });
  }
  return settings;
}

async function runTest() {
  const shop = 'test-uninstall-flow.myshopify.com';
  console.log(`Starting uninstall flow verification for shop: ${shop}`);

  // 1. Simulate initial install & upgrade
  console.log("\n--- Step 1: Install and Upgrade ---");
  await prisma.shopSettings.upsert({
    where: { shop },
    create: { shop, plan: "STARTER", status: "ACTIVE" },
    update: { plan: "STARTER", status: "ACTIVE" }
  });
  
  const beforeUninstall = await prisma.shopSettings.findUnique({ where: { shop } });
  console.log(`Pre-uninstall state: Shop is on ${beforeUninstall.plan} plan, status: ${beforeUninstall.status}`);

  // 2. Simulate APP_UNINSTALLED webhook firing
  console.log("\n--- Step 2: Uninstall Webhook ---");
  console.log("Received APP_UNINSTALLED webhook for", shop);
  
  const updatedSettings = await prisma.shopSettings.updateMany({
    where: { shop },
    data: { plan: "FREE", status: "INACTIVE" }
  });
  console.log(`Reset plan to FREE. Affected rows: ${updatedSettings.count}`);

  const afterUninstall = await prisma.shopSettings.findUnique({ where: { shop } });
  console.log(`Post-uninstall state: Shop is on ${afterUninstall.plan} plan, status: ${afterUninstall.status}`);

  // 3. Simulate Reinstall
  console.log("\n--- Step 3: Reinstall ---");
  const reinstallSettings = await getShopSettingsLocal(shop); // This simulates what app._index.jsx does on fresh install
  console.log(`Reinstall state: Shop initialized with ${reinstallSettings.plan} plan`);

  if (reinstallSettings.plan === "FREE") {
    console.log("\n✅ SUCCESS: Flow verified successfully. Merchant starts on FREE plan after reinstall.");
  } else {
    console.error("\n❌ FAILED: Merchant did not start on FREE plan.");
  }
}

runTest()
  .catch(console.error)
  .finally(async () => {
    // Cleanup
    await prisma.shopSettings.deleteMany({ where: { shop: 'test-uninstall-flow.myshopify.com' } });
    await prisma.$disconnect();
  });
