require('dotenv').config();
const { prisma } = require('./lib/database/prisma');

async function main() {
  try {
    console.log("Testing connection with DATABASE_URL...");
    const routes = await prisma.route.findMany({
      include: {
        municipality: true
      }
    });
    console.log("Success! Found", routes.length, "routes.");
  } catch (err: any) {
    console.error("Prisma Error Details:");
    console.error("Code:", err.code);
    console.error("Message:", err.message);
    if (err.meta) console.error("Meta:", JSON.stringify(err.meta, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
