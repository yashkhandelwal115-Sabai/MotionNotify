import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching active campaigns...');
  const activeConfigs = await prisma.announcementConfig.findMany({
    where: { isActive: true },
  });

  console.log(JSON.stringify(activeConfigs, null, 2));

  // Update it if requested
  if (activeConfigs.length > 0) {
    const target = activeConfigs[0];
    await prisma.announcementConfig.update({
      where: { id: target.id },
      data: { text: "🔥 Only {inventory} left in stock!" }
    });
    console.log("Updated active campaign text to: 🔥 Only {inventory} left in stock!");
  } else {
    // create a test campaign if none active
    console.log("No active campaigns found. Please create one in the Dashboard.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
