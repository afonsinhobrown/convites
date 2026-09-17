const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Ler o layout atual do nikah-verde1
  const t = await p.invitationTemplate.findFirst({
    where: { slug: 'nikah-verde1' },
    select: { id: true, slug: true, layoutJson: true, demoData: true }
  });
  
  if (!t) { console.log('NOT FOUND'); return; }
  
  const lj = t.layoutJson;
  
  // Limpar customText "undefined" (string) que foi gravado erroneamente
  for (const [k, v] of Object.entries(lj)) {
    if (v && v.customText === 'undefined') {
      lj[k] = { ...v, customText: null };
      console.log(`Cleared bad customText on: ${k}`);
    }
  }
  
  // Atualizar demoData com nomes reais do template
  const newDemoData = {
    ...t.demoData,
    brideName: 'JÚLIA',
    groomName: 'ANTÓNIO',
    groomArabicName: 'Ahmed Cassamo',
    brideArabicName: 'Catija Selemane',
    venue: 'HOTEL LUZ',
    locationName: 'HOTEL LUZ',
    time: '15H00',
    hora1: '15H00',
  };
  
  await p.invitationTemplate.update({
    where: { slug: 'nikah-verde1' },
    data: { layoutJson: lj, demoData: newDemoData }
  });
  
  console.log('Updated nikah-verde1 successfully');
  
  // Same for nikah-verde
  const t2 = await p.invitationTemplate.findFirst({
    where: { slug: 'nikah-verde' },
    select: { id: true, slug: true, layoutJson: true, demoData: true }
  });
  
  if (t2) {
    const lj2 = t2.layoutJson;
    for (const [k, v] of Object.entries(lj2)) {
      if (v && v.customText === 'undefined') {
        lj2[k] = { ...v, customText: null };
        console.log(`Cleared bad customText on nikah-verde: ${k}`);
      }
    }
    await p.invitationTemplate.update({
      where: { slug: 'nikah-verde' },
      data: { layoutJson: lj2, demoData: { ...t2.demoData, brideName: 'JÚLIA', groomName: 'ANTÓNIO' } }
    });
    console.log('Updated nikah-verde successfully');
  }
}

main().catch(console.error).finally(() => p.$disconnect());
