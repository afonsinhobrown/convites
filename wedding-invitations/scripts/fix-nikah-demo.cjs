const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const t = await p.invitationTemplate.findFirst({
    where: { slug: 'nikah-verde1' },
    select: { id: true, demoData: true, layoutJson: true }
  });
  if (!t) { console.log('not found'); return; }

  const existing = (t.demoData && typeof t.demoData === 'object') ? { ...t.demoData } : {};

  // Corrigir: remover brideName/groomName que foram incorretamente mapeados dos pais
  // Os campos de pais (brideArabicName, groomArabicName, etc.) ficam separados
  delete existing.brideName;
  delete existing.groomName;

  // Reagregar apenas os campos customText reais do layoutJson (pais, hora, local)
  const lj = t.layoutJson;
  const customFields = {};
  for (const [k, v] of Object.entries(lj)) {
    if (v && v.customText && typeof v.customText === 'string' &&
        v.customText.trim() && v.customText !== 'undefined') {
      customFields[k] = v.customText.trim();
    }
  }

  const newDemo = {
    ...existing,
    ...customFields,
    // brideName e groomName são dinâmicos (o organziador preenche) - manter sem valor fixo
    // Para a montra usa SAMPLE_DATA (JÚLIA / ANTÓNIO) como placeholder
  };

  await p.invitationTemplate.update({
    where: { id: t.id },
    data: { demoData: newDemo }
  });

  console.log('Updated demoData:', JSON.stringify(newDemo, null, 2));
}

main().catch(console.error).finally(() => p.$disconnect());
