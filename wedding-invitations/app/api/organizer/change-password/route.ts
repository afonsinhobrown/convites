import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/organizer-password";

export async function POST(request: Request) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
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

    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
    });

    if (!organizer) {
      return NextResponse.json({ error: "Organizador não encontrado" }, { status: 404 });
    }

    if (!verifyPassword(currentPassword, organizer.passwordHash)) {
      return NextResponse.json({ error: "A password atual está incorreta" }, { status: 400 });
    }

    await prisma.organizer.update({
      where: { id: organizerId },
      data: { passwordHash: hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true, message: "Password alterada com sucesso" });
  } catch (err) {
    console.error("Erro ao alterar password do organizador:", err);
    return NextResponse.json({ error: "Erro interno ao alterar password" }, { status: 500 });
  }
}
