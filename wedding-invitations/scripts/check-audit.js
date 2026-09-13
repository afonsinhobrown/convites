const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const t = await prisma.invitationTemplate.findUnique({ where: { slug: 'magnolia-classica' } });
  const keys = t.layoutJson ? Object.keys(t.layoutJson) : [];
  const b = t.layoutJson?.brideName;
  console.log("campos:", JSON.stringify(keys));
  console.log("brideName fontFamily:", b?.fontFamily, "fontSize:", b?.fontSize);
  await prisma.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
