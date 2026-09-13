import { NextResponse } from "next/server";
import { calculateGuestFee } from "@/lib/config";

export async function GET() {
  const fee = await calculateGuestFee(10);
  return NextResponse.json({ guestCount: 10, invitationFeeCents: fee });
}