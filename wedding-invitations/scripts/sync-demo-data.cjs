// Script para regenerar o demoData de TODOS os templates usando o layoutJson atual
// Garante que todos os campos customText do designer ficam persistidos no demoData

const { PrismaClient } = require('@prisma/client');

const p = new PrismaClient();

async function main() {
  const templates = await p.invitationTemplate.findMany({
    select: { id: true, slug: true, name: true, layoutJson: true, demoData: true }
  });

  console.log(`Processing ${templates.length} templates...`);

  for (const t of templates) {
    const lj = t.layoutJson;
    if (!lj || typeof lj !== 'object' || Object.keys(lj).length === 0) {
      console.log(`[SKIP] ${t.slug} - no layoutJson`);
      continue;
    }

    // Recolher TODOS os customText definidos
    const allCustomFields = {};
    for (const [k, v] of Object.entries(lj)) {
      if (v && v.customText && typeof v.customText === 'string' &&
          v.customText.trim() && v.customText !== 'undefined') {
        allCustomFields[k] = v.customText.trim();
      }
    }

    if (Object.keys(allCustomFields).length === 0) {
      console.log(`[SKIP] ${t.slug} - no customText fields`);
      continue;
    }

    const existingDemo = (t.demoData && typeof t.demoData === 'object') ? t.demoData : {};
    const newDemo = { ...existingDemo, ...allCustomFields };

    await p.invitationTemplate.update({
      where: { id: t.id },
      data: { demoData: newDemo }
    });
    console.log(`[OK] ${t.slug} - merged ${Object.keys(allCustomFields).length} custom fields:`, Object.keys(allCustomFields).join(', '));
  }

  console.log('\nDone!');
}

main().catch(console.error).finally(() => p.$disconnect());
