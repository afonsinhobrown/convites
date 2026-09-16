import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { generateSecureToken, generateQrToken, getBaseUrl } from "@/lib/invitation";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const eventId = params.id;
    const existing = await prisma.event.findFirst({
      where: { id: eventId, organizerId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    if (!existing.templatePaidAt) {
      return NextResponse.json({ error: "Evento aguarda pagamento" }, { status: 402 });
    }

    const guests = await prisma.guest.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });

    const updates = await Promise.all(
      guests
        .filter((g) => !g.secureToken || !g.qrToken)
        .map((g) =>
          prisma.guest.update({
            where: { id: g.id },
            data: {
              secureToken: g.secureToken || generateSecureToken(),
              qrToken: g.qrToken || generateQrToken(),
            },
          })
        )
    );

    const finalGuests = await prisma.guest.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });

    const baseUrl = getBaseUrl();
    void updates;

    return NextResponse.json(
      finalGuests.map((g) => ({
        id: g.id,
        name: g.name,
        secureToken: g.secureToken,
        inviteUrl: `${baseUrl}/invite/${g.secureToken}`,
      }))
    );
  } catch (error) {
    console.error("Erro ao gerar convites:", error);
    return NextResponse.json({ error: "Erro interno ao gerar convites" }, { status: 500 });
  }
}