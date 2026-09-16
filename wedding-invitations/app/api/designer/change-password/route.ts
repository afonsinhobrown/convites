import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DESIGNER_COOKIE_NAME, verifyDesignerSessionToken } from "@/lib/designer-auth";
import { hashPassword, verifyPassword } from "@/lib/organizer-password";

export async function POST(request: Request) {
  try {
    const token = cookies().get(DESIGNER_COOKIE_NAME)?.value;
    const designerId = token ? await verifyDesignerSessionToken(token) : null;
    if (!designerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova password deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
    });

    if (!designer) {
      return NextResponse.json({ error: "Designer não encontrado" }, { status: 404 });
    }

    if (!verifyPassword(currentPassword, designer.passwordHash)) {
      return NextResponse.json({ error: "A password atual está incorreta" }, { status: 400 });
    }

    await prisma.designer.update({
      where: { id: designerId },
      data: { passwordHash: hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true, message: "Password alterada com sucesso" });
  } catch (err) {
    console.error("Erro ao alterar password do designer:", err);
    return NextResponse.json({ error: "Erro interno ao alterar password" }, { status: 500 });
  }
}
