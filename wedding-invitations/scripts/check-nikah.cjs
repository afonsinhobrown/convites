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
    for (const [k, v] of Object.entries(lj)) {
      console.log(`[${k}] x=${v?.x?.toFixed(1)} y=${v?.y?.toFixed(1)} w=${v?.width} h=${v?.height} fs=${v?.fontSize?.toFixed(1)} font="${v?.fontFamily}" align=${v?.textAlign} ct="${v?.customText}"`);
    }
  }
}

main().catch(console.error).finally(() => p.$disconnect());
