import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/superadmin-auth";
import { hashPassword, verifyPassword } from "@/lib/organizer-password";

export async function POST(request: Request) {
  try {
    const current = await getCurrentAdmin();
    if (!current) {
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

    if (current.isMaster && current.id === "master") {
      return NextResponse.json(
        { error: "A senha do SuperAdmin Master é gerida através da variável de ambiente SUPERADMIN_PASSWORD no painel de controlo da Vercel." },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: current.id },
    });

    if (!admin) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (!verifyPassword(currentPassword, admin.passwordHash)) {
      return NextResponse.json({ error: "A password atual está incorreta" }, { status: 400 });
    }

    await prisma.adminUser.update({
      where: { id: current.id },
      data: { passwordHash: hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true, message: "Password atualizada com sucesso" });
  } catch (err) {
    console.error("Erro ao alterar password de admin:", err);
    return NextResponse.json({ error: "Erro interno ao alterar password" }, { status: 500 });
  }
}
