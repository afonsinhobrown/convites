import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DESIGNER_COOKIE_NAME } from "@/lib/designer-auth";

export async function POST() {
  cookies().delete(DESIGNER_COOKIE_NAME);
  return NextResponse.redirect(new URL("/designer/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
