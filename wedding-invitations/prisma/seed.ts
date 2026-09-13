import { PrismaClient } from '@prisma/client'
import { DEFAULT_LAYOUTS } from '../lib/designer-layout'
import { hashPassword } from '../lib/organizer-password'

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
    { slug: 'magnolia-gold', name: 'Magnólia Dourada', componentName: 'MagnoliaGoldLayout', priceUsdCents: 1500, sortOrder: 1 },
    { slug: 'classic-centered', name: 'Clássico Centralizado', componentName: 'ClassicCenteredLayout', priceUsdCents: 1500, sortOrder: 2 },
    { slug: 'photo-fullscreen', name: 'Foto Ecrã Inteiro', componentName: 'PhotoFullscreenLayout', priceUsdCents: 1700, sortOrder: 3 },
    { slug: 'minimal-banner', name: 'Banner Minimalista', componentName: 'MinimalBannerLayout', priceUsdCents: 1500, sortOrder: 4 },
    { slug: 'vintage-floral', name: 'Floral Vintage', componentName: 'VintageFloralLayout', priceUsdCents: 1600, sortOrder: 5 },
    { slug: 'modern-dark', name: 'Moderno Escuro', componentName: 'ModernDarkLayout', priceUsdCents: 1600, sortOrder: 6 },
    { slug: 'elegant-serif', name: 'Elegante com Serifa', componentName: 'ElegantSerifLayout', priceUsdCents: 1500, sortOrder: 7 },
    { slug: 'boho-chic', name: 'Boho Chic', componentName: 'BohoChicLayout', priceUsdCents: 1700, sortOrder: 8 },
    { slug: 'royal-blue', name: 'Azul Real', componentName: 'RoyalBlueLayout', priceUsdCents: 1500, sortOrder: 9 },
    { slug: 'geometric-rose', name: 'Geométrico Rosa', componentName: 'GeometricRoseLayout', priceUsdCents: 1600, sortOrder: 10 },
    { slug: 'magnolia-classica', name: 'Magnólia Clássica', componentName: 'MagnoliaClassicaLayout', priceUsdCents: 1500, sortOrder: 11, previewUrl: '/templates/magnolia-classica/fundo.png', layoutJson: DEFAULT_LAYOUTS['magnolia-classica'] },
    { slug: 'magnolia-casal', name: 'Magnólia Casal', componentName: 'MagnoliaCasalLayout', priceUsdCents: 1700, sortOrder: 12, previewUrl: '/templates/magnolia-casal/fundo.png', layoutJson: DEFAULT_LAYOUTS['magnolia-casal'] },
    { slug: 'magnolia-organica', name: 'Magnólia Orgânica', componentName: 'MagnoliaOrganicaLayout', priceUsdCents: 1600, sortOrder: 13, previewUrl: '/templates/magnolia-organica/fundo.png', layoutJson: DEFAULT_LAYOUTS['magnolia-organica'] },
  ]

  for (const t of templates) {
    await prisma.invitationTemplate.upsert({
      where: { slug: t.slug } as any,
      update: t as any,
      create: t as any,
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
