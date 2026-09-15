import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DESIGNER_COOKIE_NAME, verifyDesignerSessionToken } from "@/lib/designer-auth";

async function getDesigner() {
  const token = cookies().get(DESIGNER_COOKIE_NAME)?.value;
  const designerId = token ? await verifyDesignerSessionToken(token) : null;
  if (!designerId) return null;
  const designer = await prisma.designer.findUnique({ where: { id: designerId } });
  if (!designer || !designer.active) return null;
  return designer;
}

// PATCH — guardar layoutJson
export async function PATCH(request: Request, { params }: { params: { templateId: string } }) {
  try {
    const designer = await getDesigner();
    if (!designer) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body.layoutJson !== "object" || body.layoutJson === null)
      return NextResponse.json({ error: "layoutJson inválido" }, { status: 400 });

    const template = await prisma.invitationTemplate.update({
      where: { slug: params.templateId },
      data: { layoutJson: body.layoutJson, editedById: designer.id, editedAt: new Date() },
    });

    return NextResponse.json({ id: template.id, slug: template.slug, layoutJson: template.layoutJson });
  } catch (error) {
    console.error("Erro ao guardar layout do template:", error);
    return NextResponse.json({ error: "Erro interno ao guardar layout" }, { status: 500 });
  }
}

// DELETE — eliminar permanentemente (só DRAFT)
export async function DELETE(_req: Request, { params }: { params: { templateId: string } }) {
  try {
    const designer = await getDesigner();
    if (!designer) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const template = await prisma.invitationTemplate.findUnique({ where: { slug: params.templateId } });
    if (!template) return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });

    if (template.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Só é possível eliminar templates em DRAFT. Despublica primeiro." },
        { status: 409 }
      );
    }

    await prisma.invitationTemplate.delete({ where: { slug: params.templateId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Erro ao eliminar template:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}