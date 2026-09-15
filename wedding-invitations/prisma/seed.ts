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
  
  const templates = [
    { slug: 'magnolia-classica', name: 'Magnólia Clássica', componentName: 'MagnoliaClassicaLayout', priceUsdCents: 1500, sortOrder: 1, previewUrl: '/templates/magnolia-classica/fundo.png', layoutJson: DEFAULT_LAYOUTS['magnolia-classica'] },
    { slug: 'magnolia-casal', name: 'Magnólia Casal', componentName: 'MagnoliaCasalLayout', priceUsdCents: 1700, sortOrder: 2, previewUrl: '/templates/magnolia-casal/fundo.png', layoutJson: DEFAULT_LAYOUTS['magnolia-casal'] },
    { slug: 'magnolia-organica', name: 'Magnólia Orgânica', componentName: 'MagnoliaOrganicaLayout', priceUsdCents: 1600, sortOrder: 3, previewUrl: '/templates/magnolia-organica/fundo.png', layoutJson: DEFAULT_LAYOUTS['magnolia-organica'] },
  ]

  for (const t of templates) {
    const data = { ...t, demoData: DEMO_DATA }
    await prisma.invitationTemplate.upsert({
      where: { slug: t.slug } as any,
      update: data as any,
      create: data as any,
    })
  }

  console.log('Seeding System Config...')
  const existingConfig = await prisma.systemConfig.findFirst()
  if (!existingConfig) {
    await prisma.systemConfig.create({
      data: {
        invitationFeeCents: 5000,
        bimExchangeRate: 64,
        netshopEnabled: true
      }
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
