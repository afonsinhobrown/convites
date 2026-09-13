const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const t = await prisma.invitationTemplate.findUnique({ where: { slug: 'magnolia-casal' } });
  const keys = t.layoutJson ? Object.keys(t.layoutJson) : [];
  console.log("campos layoutJson restaurados:", JSON.stringify(keys));
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
