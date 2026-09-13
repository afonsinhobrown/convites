import { NextResponse } from "next/server";
import { convertUsdToMzn } from "@/lib/config";

export async function GET() {
  const mznCents = await convertUsdToMzn(1500);
  return NextResponse.json({ usdCents: 1500, mznCents });
}