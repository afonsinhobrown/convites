import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DESIGNER_COOKIE_NAME, verifyDesignerSessionToken } from "@/lib/designer-auth";

// POST /api/designer/templates/[templateId]/duplicate
// Cria uma cópia DRAFT do template com slug = "<slug>-v<n>"
export async function POST(_req: Request, { params }: { params: { templateId: string } }) {
  try {
    const token = cookies().get(DESIGNER_COOKIE_NAME)?.value;
    const designerId = token ? await verifyDesignerSessionToken(token) : null;
    if (!designerId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const designer = await prisma.designer.findUnique({ where: { id: designerId } });
    if (!designer || !designer.active) return NextResponse.json({ error: "Designer inativo" }, { status: 403 });

    const source = await prisma.invitationTemplate.findUnique({ where: { slug: params.templateId } });
    if (!source) return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });

    // Encontrar slug único: <slug>-v2, -v3, …
    let n = 2;
    let newSlug = `${source.slug}-v${n}`;
    while (await prisma.invitationTemplate.findUnique({ where: { slug: newSlug } })) {
      n++;
      newSlug = `${source.slug}-v${n}`;
    }

    const copy = await prisma.invitationTemplate.create({
      data: {
        slug: newSlug,
        name: `${source.name} (cópia)`,
        description: source.description,
        componentName: source.componentName,
        previewUrl: source.previewUrl,
        layoutJson: source.layoutJson ?? undefined,
        demoData: source.demoData ?? undefined,
        priceUsdCents: source.priceUsdCents,
        sortOrder: source.sortOrder + 1,
        status: "DRAFT",
        parentId: source.id,
        editedById: designerId,
        editedAt: new Date(),
      },
    });

    return NextResponse.json({ slug: copy.slug, name: copy.name });
  } catch (error) {
    console.error("Erro ao duplicar template:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
