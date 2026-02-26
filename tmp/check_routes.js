const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const routes = await prisma.$queryRaw`SELECT * FROM routes LIMIT 1`;
    console.log(JSON.stringify(routes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
