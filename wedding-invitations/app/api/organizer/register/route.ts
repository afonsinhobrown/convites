import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/organizer-password";
import { createOrganizerSessionToken } from "@/lib/organizer-auth";
import { ORGANIZER_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!name) {
      return NextResponse.json({ error: "O nome é obrigatório" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "A password deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    const existing = await prisma.organizer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já registado" }, { status: 409 });
    }

    const organizer = await prisma.organizer.create({
      data: { name, email, passwordHash: hashPassword(password) },
    });

    const token = await createOrganizerSessionToken(organizer.id);
    cookies().set(ORGANIZER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ id: organizer.id, name: organizer.name, email: organizer.email });
  } catch (error) {
    console.error("Erro no registo:", error);
    return NextResponse.json({ error: "Erro interno ao registar" }, { status: 500 });
  }
}