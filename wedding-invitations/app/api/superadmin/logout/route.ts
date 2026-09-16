import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  cookies().set("superadmin_token", "", { httpOnly: true, path: "/", maxAge: 0 });

  const accept = request.headers.get("accept") || "";
  if (accept.includes("application/json")) {
    return NextResponse.json({ ok: true });
  }

  const url = new URL("/superadmin/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: Request) {
  cookies().set("superadmin_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  const url = new URL("/superadmin/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}
