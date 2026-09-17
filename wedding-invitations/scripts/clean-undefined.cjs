const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t1 = await prisma.invitationTemplate.findFirst({
    where: { slug: 'nikah-verde1' },
    select: { id: true, slug: true, layoutJson: true, demoData: true }
  });

  if (t1 && t1.layoutJson) {
    const lj = { ...t1.layoutJson };
    for (const [k, v] of Object.entries(lj)) {
      if (v && v.customText === 'undefined') {
        const copy = { ...v };
        delete copy.customText;
        lj[k] = copy;
      }
    }
    lj.brideName = { ...lj.brideName, customText: 'FATIMA' };
    lj.groomName = { ...lj.groomName, customText: 'OMAR' };

    await prisma.invitationTemplate.update({
      where: { id: t1.id },
      data: { layoutJson: lj }
    });
    console.log('Cleaned string "undefined" in nikah-verde1 layoutJson');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
