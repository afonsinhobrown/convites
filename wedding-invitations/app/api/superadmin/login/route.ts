import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "superadmin_token";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (
    typeof password !== "string" ||
    password === "" ||
    password !== process.env.SUPERADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: "Password incorreta" }, { status: 401 });
  }

  cookies().set(COOKIE_NAME, process.env.SUPERADMIN_COOKIE_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}