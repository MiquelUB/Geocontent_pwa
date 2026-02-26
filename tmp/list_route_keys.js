const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.$queryRaw`
    SELECT * FROM routes LIMIT 1
  `;
    if (result.length > 0) {
        process.stdout.write(JSON.stringify(Object.keys(result[0])));
    } else {
        process.stdout.write("empty");
    }
}

main().catch(e => {
    process.stderr.write(e.message);
    process.exit(1);
}).finally(() => prisma.$disconnect());
