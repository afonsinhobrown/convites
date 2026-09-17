const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.invitationTemplate.findMany({
    select: { id: true, slug: true, name: true, demoData: true }
  });
  for (const t of templates) {
    console.log(`Template: ${t.slug} (${t.name})`);
    console.log('  demoData:', JSON.stringify(t.demoData));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
