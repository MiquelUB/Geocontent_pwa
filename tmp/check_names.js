const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const routes = await prisma.$queryRawUnsafe('SELECT name, slug, municipality_id FROM routes');
    const munis = await prisma.$queryRawUnsafe('SELECT id, name FROM municipalities');
    console.log('ROUTES:', JSON.stringify(routes, null, 2));
    console.log('MUNIS:', JSON.stringify(munis, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
