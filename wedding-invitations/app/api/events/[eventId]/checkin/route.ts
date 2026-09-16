import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { pin, token, companionId } = body;

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: {
        id: true,
        brideName: true,
        groomName: true,
        securityPin: true,
        status: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    // Validação do PIN da Portaria
    const expectedPin = event.securityPin || "1234";
    if (String(pin).trim() !== expectedPin.trim()) {
      return NextResponse.json({ error: "PIN de segurança inválido" }, { status: 401 });
    }

    // Se for check-in de acompanhante específico
    if (companionId) {
      const companion = await prisma.companion.findUnique({
        where: { id: companionId },
      });
      if (!companion) {
        return NextResponse.json({ error: "Acompanhante não encontrado" }, { status: 404 });
      }
      const updatedCompanion = await prisma.companion.update({
        where: { id: companionId },
        data: { checkedIn: true },
      });
      return NextResponse.json({
        status: "COMPANION_CHECKED_IN",
        companion: updatedCompanion,
      });
    }

    if (!token) {
      return NextResponse.json({ error: "Código do convite não fornecido" }, { status: 400 });
    }

    // Extrair token limpo caso venha como URL completa (ex: .../invite/token_xyz)
    const rawToken = String(token).trim();
    const cleanToken = rawToken.includes("/") ? rawToken.split("/").pop() || rawToken : rawToken;

    // Buscar convidado pelo qrToken ou secureToken no evento
    const guest = await prisma.guest.findFirst({
      where: {
        eventId: params.eventId,
        OR: [{ qrToken: cleanToken }, { secureToken: cleanToken }],
      },
      include: {
        companions: true,
      },
    });

    if (!guest) {
      return NextResponse.json(
        {
          status: "INVALID",
          message: "Convite não encontrado para este evento.",
        },
        { status: 404 }
      );
    }

    // Verificar se já deu entrada anteriormente
    if (guest.checkedInAt) {
      return NextResponse.json({
        status: "ALREADY_CHECKED_IN",
        message: `Atenção: Este convite já deu entrada em ${new Date(
          guest.checkedInAt
        ).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}.`,
        guest: {
          id: guest.id,
          name: guest.name,
          guestsCount: guest.guestsCount,
          maxCompanions: guest.maxCompanions,
          checkedInAt: guest.checkedInAt,
          companions: guest.companions,
        },
      });
    }

    // Registar entrada com sucesso
    const now = new Date();
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: { checkedInAt: now },
      include: { companions: true },
    });

    return NextResponse.json({
      status: "SUCCESS",
      message: "Entrada Autorizada!",
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        guestsCount: updatedGuest.guestsCount,
        maxCompanions: updatedGuest.maxCompanions,
        checkedInAt: updatedGuest.checkedInAt,
        companions: updatedGuest.companions,
      },
    });
  } catch (error) {
    console.error("Erro no check-in da portaria:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get("pin");

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      include: {
        guests: {
          orderBy: { name: "asc" },
          include: { companions: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const expectedPin = event.securityPin || "1234";
    if (pin !== expectedPin) {
      return NextResponse.json({ error: "PIN inválido" }, { status: 401 });
    }

    const checkedInGuests = event.guests.filter((g) => g.checkedInAt !== null);
    const totalConfirmed = event.guests.filter((g) => g.rsvpStatus === "CONFIRMED");

    return NextResponse.json({
      event: {
        id: event.id,
        brideName: event.brideName,
        groomName: event.groomName,
        status: event.status,
      },
      stats: {
        totalGuests: event.guests.length,
        totalConfirmed: totalConfirmed.length,
        totalCheckedIn: checkedInGuests.length,
      },
      guests: event.guests.map((g) => ({
        id: g.id,
        name: g.name,
        phone: g.phone,
        rsvpStatus: g.rsvpStatus,
        guestsCount: g.guestsCount,
        maxCompanions: g.maxCompanions,
        checkedInAt: g.checkedInAt,
        companions: g.companions,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar dados da portaria:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
