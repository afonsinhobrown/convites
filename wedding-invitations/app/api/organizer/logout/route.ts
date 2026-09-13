import { NextResponse } from "next/server";
import { ORGANIZER_COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST() {
  cookies().set(ORGANIZER_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}