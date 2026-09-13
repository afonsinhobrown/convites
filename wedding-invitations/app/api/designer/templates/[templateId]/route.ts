import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { templateId: string } }) {
  try {
    const token = cookies().get("superadmin_token")?.value;
    if (!token || token !== process.env.SUPERADMIN_COOKIE_SECRET) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.layoutJson !== "object" || body.layoutJson === null) {
      return NextResponse.json({ error: "layoutJson inválido" }, { status: 400 });
    }

    const template = await prisma.invitationTemplate.update({
      where: { slug: params.templateId },
      data: { layoutJson: body.layoutJson },
    });

    return NextResponse.json({ id: template.id, slug: template.slug, layoutJson: template.layoutJson });
  } catch (error) {
    console.error("Erro ao guardar layout do template:", error);
    return NextResponse.json({ error: "Erro interno ao guardar layout" }, { status: 500 });
  }
}