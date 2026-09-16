import { NextResponse } from "next/server";
import { ORGANIZER_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  cookies().set(ORGANIZER_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });

  const accept = request.headers.get("accept") || "";
  if (accept.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }

  // 303 See Other garante que o browser faz GET para /organizer/login em vez de repetir POST
  const url = new URL("/organizer/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: Request) {
  cookies().set(ORGANIZER_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  const url = new URL("/organizer/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}