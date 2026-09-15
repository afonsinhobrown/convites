import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; guestId: string } }
) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const eventId = params.id;
    const guestId = params.guestId;

    // Verificar posse do evento
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const guest = await prisma.guest.findFirst({
      where: { id: guestId, eventId },
    });
    if (!guest) {
      return NextResponse.json({ error: "Convidado não encontrado" }, { status: 404 });
    }

    await prisma.guest.delete({
      where: { id: guestId },
    });

    return NextResponse.json({ ok: true, id: guestId });
  } catch (error) {
    console.error("Erro ao remover convidado:", error);
    return NextResponse.json({ error: "Erro interno ao remover convidado" }, { status: 500 });
  }
}
