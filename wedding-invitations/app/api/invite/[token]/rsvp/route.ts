import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RSVP_VALUES = ["CONFIRMED", "DECLINED"] as const;

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const body = await request.json();
    const rsvpStatus = body?.rsvpStatus;
    const guestsCountRaw = Number(body?.guestsCount ?? 1);

    if (!RSVP_VALUES.includes(rsvpStatus)) {
      return NextResponse.json({ error: "Estado RSVP inválido" }, { status: 400 });
    }
    if (!Number.isFinite(guestsCountRaw) || guestsCountRaw < 1 || guestsCountRaw > 10) {
      return NextResponse.json({ error: "Número de pessoas inválido" }, { status: 400 });
    }

    const guest = await prisma.guest.findUnique({
      where: { secureToken: params.token },
    });
    if (!guest) {
      return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
    }

    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        rsvpStatus,
        guestsCount: rsvpStatus === "CONFIRMED" ? Math.floor(guestsCountRaw) : 0,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({
      rsvpStatus: updated.rsvpStatus,
      guestsCount: updated.guestsCount,
      respondedAt: updated.respondedAt,
    });
  } catch (error) {
    console.error("Erro no RSVP:", error);
    return NextResponse.json({ error: "Erro interno ao registar RSVP" }, { status: 500 });
  }
}