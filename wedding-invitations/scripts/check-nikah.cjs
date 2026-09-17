const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const t = await p.invitationTemplate.findFirst({
    where: { slug: 'nikah-verde1' },
    select: { slug: true, name: true, layoutJson: true, demoData: true }
  });
  
  if (!t) { console.log('NOT FOUND'); return; }
  
  console.log('SLUG:', t.slug);
  const lj = t.layoutJson;
  if (lj && typeof lj === 'object') {
    // Show all keys and their sourceKey
    for (const [k, v] of Object.entries(lj)) {
      console.log(`  [${k}] sourceKey=${v?.sourceKey}, customText="${v?.customText}", fontSize=${v?.fontSize}, width=${v?.width}, height=${v?.height}`);
    }
  }
}

main().catch(console.error).finally(() => p.$disconnect());
