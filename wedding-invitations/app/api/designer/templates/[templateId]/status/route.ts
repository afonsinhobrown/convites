import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DESIGNER_COOKIE_NAME, verifyDesignerSessionToken } from "@/lib/designer-auth";

const VALID_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type Status = (typeof VALID_STATUSES)[number];

export async function PATCH(request: Request, { params }: { params: { templateId: string } }) {
  try {
    const token = cookies().get(DESIGNER_COOKIE_NAME)?.value;
    const designerId = token ? await verifyDesignerSessionToken(token) : null;
    if (!designerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const designer = await prisma.designer.findUnique({ where: { id: designerId } });
    if (!designer || !designer.active) {
      return NextResponse.json({ error: "Designer inativo" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const target = body?.status as Status | undefined;
    if (!target || !VALID_STATUSES.includes(target)) {
      return NextResponse.json(
        { error: "status inválido (use DRAFT, PUBLISHED ou ARCHIVED)" },
        { status: 400 }
      );
    }

    const template = await prisma.invitationTemplate.update({
      where: { slug: params.templateId },
      data: {
        status: target,
        publishedAt: target === "PUBLISHED" ? new Date() : null,
        editedById: designerId,
        editedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: template.id,
      slug: template.slug,
      status: template.status,
      publishedAt: template.publishedAt,
    });
  } catch (error) {
    console.error("Erro ao actualizar estado do template:", error);
    return NextResponse.json({ error: "Erro interno ao actualizar estado" }, { status: 500 });
  }
}
