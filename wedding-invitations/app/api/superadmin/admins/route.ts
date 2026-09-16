import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/superadmin-auth";
import { hashPassword } from "@/lib/organizer-password";

export async function GET() {
  try {
    const current = await getCurrentAdmin();
    if (!current) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isMaster: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ admins, current });
  } catch (err) {
    console.error("Erro ao listar administradores:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const current = await getCurrentAdmin();
    if (!current) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e password são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A password deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um utilizador administrador com este email" },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
        isMaster: false, // Novos admins criados não são master
        active: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isMaster: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar administrador:", err);
    return NextResponse.json({ error: "Erro ao criar administrador" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const current = await getCurrentAdmin();
    if (!current) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de administrador obrigatório" }, { status: 400 });
    }

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Administrador não encontrado" }, { status: 404 });
    }

    if (target.isMaster) {
      return NextResponse.json({ error: "O administrador master não pode ser removido" }, { status: 403 });
    }

    await prisma.adminUser.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao remover administrador:", err);
    return NextResponse.json({ error: "Erro ao remover administrador" }, { status: 500 });
  }
}
