import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/organizer-password";
import { createSuperAdminSessionToken, SUPERADMIN_COOKIE_NAME } from "@/lib/superadmin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json({ error: "Password obrigatória" }, { status: 400 });
    }

    // 1. Verificação de Senha Master
    const masterPassword = process.env.SUPERADMIN_PASSWORD;
    if (masterPassword && password === masterPassword) {
      const token = await createSuperAdminSessionToken({
        sub: "master",
        email: email || "master@doremi.local",
        name: "SuperAdmin Master",
        isMaster: true,
      });

      cookies().set(SUPERADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return NextResponse.json({ ok: true, isMaster: true });
    }

    // 2. Verificação de Utilizador Admin na Base de Dados (se forneceu email)
    if (email) {
      const admin = await prisma.adminUser.findUnique({
        where: { email },
      });

      if (admin && admin.active && verifyPassword(password, admin.passwordHash)) {
        const token = await createSuperAdminSessionToken({
          sub: admin.id,
          email: admin.email,
          name: admin.name,
          isMaster: admin.isMaster,
        });

        cookies().set(SUPERADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });

        return NextResponse.json({ ok: true, isMaster: admin.isMaster });
      }
    }

    return NextResponse.json({ error: "Credenciais de administrador incorretas" }, { status: 401 });
  } catch (err) {
    console.error("Erro no login de superadmin:", err);
    return NextResponse.json({ error: "Erro ao processar login" }, { status: 500 });
  }
}