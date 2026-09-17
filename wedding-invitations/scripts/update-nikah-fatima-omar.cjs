const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Updating nikah-verde1 ---');
  const t1 = await prisma.invitationTemplate.findFirst({
    where: { slug: 'nikah-verde1' },
    select: { id: true, slug: true, layoutJson: true, demoData: true }
  });

  if (t1) {
    const lj = t1.layoutJson ? { ...t1.layoutJson } : {};
    
    // Configurar customText para brideName e groomName se existirem
    if (lj.brideName) {
      lj.brideName = { ...lj.brideName, customText: 'FATIMA' };
    }
    if (lj.groomName) {
      lj.groomName = { ...lj.groomName, customText: 'OMAR' };
    }

    const demo = (t1.demoData && typeof t1.demoData === 'object' ? t1.demoData : {});
    const newDemo = {
      ...demo,
      brideName: 'FATIMA',
      groomName: 'OMAR',
      noivos: 'FATIMA & OMAR',
      brideArabicName: demo.brideArabicName || 'Catija Selemane',
      groomArabicName: demo.groomArabicName || 'Ahmed Cassamo',
    };

    await prisma.invitationTemplate.update({
      where: { id: t1.id },
      data: { layoutJson: lj, demoData: newDemo }
    });
    console.log('nikah-verde1 successfully updated to FATIMA & OMAR!');
  } else {
    console.log('nikah-verde1 not found!');
  }

  console.log('--- Updating nikah-verde ---');
  const t2 = await prisma.invitationTemplate.findFirst({
    where: { slug: 'nikah-verde' },
    select: { id: true, slug: true, layoutJson: true, demoData: true }
  });

  if (t2) {
    const demo2 = (t2.demoData && typeof t2.demoData === 'object' ? t2.demoData : {});
    const newDemo2 = {
      ...demo2,
      brideName: 'FATIMA',
      groomName: 'OMAR',
      noivos: 'FATIMA & OMAR',
    };

    await prisma.invitationTemplate.update({
      where: { id: t2.id },
      data: { demoData: newDemo2 }
    });
    console.log('nikah-verde successfully updated to FATIMA & OMAR!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
