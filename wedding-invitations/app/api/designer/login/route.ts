import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/organizer-password";
import { createDesignerSessionToken, DESIGNER_COOKIE_NAME } from "@/lib/designer-auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password são obrigatórios" }, { status: 400 });
    }

    const designer = await prisma.designer.findUnique({ where: { email } });
    if (!designer || !designer.active || !verifyPassword(password, designer.passwordHash)) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = await createDesignerSessionToken(designer.id);
    cookies().set(DESIGNER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ id: designer.id, name: designer.name, email: designer.email });
  } catch (error) {
    console.error("Erro no login do designer:", error);
    return NextResponse.json({ error: "Erro interno no login" }, { status: 500 });
  }
}