import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/organizer-password";
import { createOrganizerSessionToken } from "@/lib/organizer-auth";
import { ORGANIZER_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email e password são obrigatórios" }, { status: 400 });
    }

    const organizer = await prisma.organizer.findUnique({ where: { email } });
    if (!organizer || !verifyPassword(password, organizer.passwordHash)) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = await createOrganizerSessionToken(organizer.id);
    cookies().set(ORGANIZER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ id: organizer.id, name: organizer.name, email: organizer.email });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ error: "Erro interno no login" }, { status: 500 });
  }
}