import { PrismaClient } from '@prisma/client'
import { DEFAULT_LAYOUTS } from '../lib/designer-layout'
import { hashPassword } from '../lib/organizer-password'
import { DEMO_DATA } from '../lib/demo-data'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Designer...')
  await prisma.designer.upsert({
    where: { email: 'designer@doremi.local' },
    update: { name: 'Designer Doremi', passwordHash: hashPassword('designer123'), active: true },
    create: {
      email: 'designer@doremi.local',
      name: 'Designer Doremi',
      passwordHash: hashPassword('designer123'),
    },
  })

  console.log('Seeding Invitation Templates...')

  // 5 templates: os 3 Magnólia + 2 novos (aditivo).
  // - magnolia-casal é o único editado (demoData + layout completos).
  // - magnolia-dourada-casal é uma variação do casal (parentId) e reutiliza
  //   layout+demo do próprio casal para renderizar na montra.
  // - esmeralda-fotos fica só com o fundo próprio (montra usa a thumbnail).
  const templates = [
    { slug: 'magnolia-classica', name: 'Magnólia Clássica', componentName: 'MagnoliaClassicaLayout', priceUsdCents: 1500, sortOrder: 1, previewUrl: '/templates/magnolia-classica/fundo.png', status: 'PUBLISHED', publishedAt: new Date() },
    { slug: 'magnolia-casal', name: 'Magnólia Casal', componentName: 'MagnoliaCasalLayout', priceUsdCents: 1700, sortOrder: 2, previewUrl: '/templates/magnolia-casal/fundo.png', layoutJson: DEFAULT_LAYOUTS['magnolia-casal'], demoData: DEMO_DATA },
    { slug: 'magnolia-organica', name: 'Magnólia Orgânica', componentName: 'MagnoliaOrganicaLayout', priceUsdCents: 1600, sortOrder: 3, previewUrl: '/templates/magnolia-organica/fundo.png' },
    { slug: 'magnolia-dourada-casal', name: 'Magnólia Dourada Casal', componentName: 'MagnoliaCasalLayout', priceUsdCents: 1800, sortOrder: 4, previewUrl: '/templates/magnolia-dourada-casal/fundo.png', layoutJson: DEFAULT_LAYOUTS['magnolia-casal'], demoData: DEMO_DATA, parentId: (await prisma.invitationTemplate.findUnique({ where: { slug: 'magnolia-casal' }, select: { id: true } }))?.id },
    { slug: 'esmeralda-fotos', name: 'Esmeralda Fotos', componentName: 'MagnoliaOrganicaLayout', priceUsdCents: 2000, sortOrder: 5, previewUrl: '/templates/esmeralda-fotos/fundo.png' },
  ]

  for (const t of templates) {
    await prisma.invitationTemplate.upsert({
      where: { slug: t.slug },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: t as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: t as any,
    })
  }

  await prisma.invitationTemplate.updateMany({
    where: { slug: { in: ['magnolia-classica', 'magnolia-casal', 'magnolia-organica'] } },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  })

  console.log('Seeding Assets (ficheiros reais de ASSETS/ no designer)...')
  // Aditivo: correspondência 1:1 com os PNGs copiados para public/assets/.
  // Usamos exactamente os nomes dos ficheiros reais (ALIANCA.png, FLORES.png);
  // slug/categoria derivam do nome sem inventar assets que não existem.
  const assets = [
    { slug: 'alianca', name: 'Aliança', category: 'aneis', fileUrl: '/assets/ALIANCA.png', sortOrder: 1 },
    { slug: 'flores', name: 'Flores', category: 'flores', fileUrl: '/assets/FLORES.png', sortOrder: 2 },
  ]

  for (const a of assets) {
    await prisma.asset.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    })
  }

  console.log('Seeding System Config...')
  const existingConfig = await prisma.systemConfig.findFirst()
  if (!existingConfig) {
    await prisma.systemConfig.create({
      data: { invitationFeeCents: 2500, bimExchangeRate: 64, netshopEnabled: true },
    })
  } else {
    await prisma.systemConfig.update({
      where: { id: existingConfig.id },
      data: { invitationFeeCents: 2500 },
    })
  }

  console.log('Seeding completo!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
