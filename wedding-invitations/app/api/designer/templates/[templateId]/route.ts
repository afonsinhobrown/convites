import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DESIGNER_COOKIE_NAME, verifyDesignerSessionToken } from "@/lib/designer-auth";

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
    if (!body || typeof body.layoutJson !== "object" || body.layoutJson === null) {
      return NextResponse.json({ error: "layoutJson inválido" }, { status: 400 });
    }

    const template = await prisma.invitationTemplate.update({
      where: { slug: params.templateId },
      data: { layoutJson: body.layoutJson, editedById: designerId, editedAt: new Date() },
    });

    return NextResponse.json({ id: template.id, slug: template.slug, layoutJson: template.layoutJson });
  } catch (error) {
    console.error("Erro ao guardar layout do template:", error);
    return NextResponse.json({ error: "Erro interno ao guardar layout" }, { status: 500 });
  }
}