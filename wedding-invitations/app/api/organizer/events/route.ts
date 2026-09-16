import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";

import { normalizeMozPhone } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const brideName = String(body?.brideName ?? "").trim();
    const groomName = String(body?.groomName ?? "").trim();
    const weddingDateRaw = String(body?.weddingDate ?? "");
    const ceremonyTime = String(body?.ceremonyTime ?? "").trim();
    const ceremonyVenue = String(body?.ceremonyVenue ?? "").trim();
    const ceremonyAddress = String(body?.ceremonyAddress ?? "").trim();
    const rsvpContactRaw = String(body?.rsvpContact ?? "").trim();
    const welcomeMessage = String(body?.welcomeMessage ?? "").trim();
    const templateSlug = String(body?.templateSlug ?? "magnolia-casal").trim();

    if (!brideName || !groomName) {
      return NextResponse.json({ error: "Os nomes dos noivos são obrigatórios" }, { status: 400 });
    }
    if (!weddingDateRaw || Number.isNaN(new Date(weddingDateRaw).getTime())) {
      return NextResponse.json({ error: "Data do casamento inválida" }, { status: 400 });
    }
    if (!ceremonyTime || !ceremonyVenue) {
      return NextResponse.json({ error: "Hora e local são obrigatórios" }, { status: 400 });
    }
    if (!rsvpContactRaw) {
      return NextResponse.json({ error: "O contacto RSVP é obrigatório" }, { status: 400 });
    }

    const rsvpContact = normalizeMozPhone(rsvpContactRaw) || rsvpContactRaw;

    const weddingDate = new Date(`${weddingDateRaw}T12:00:00`);

    const event = await prisma.event.create({
      data: {
        organizerId,
        brideName,
        groomName,
        weddingDate,
        ceremonyTime,
        ceremonyVenue,
        ceremonyAddress,
        rsvpContact,
        welcomeMessage: welcomeMessage || null,
        templateSlug,
        invitationHeader: body?.invitationHeader ? String(body.invitationHeader).trim() : undefined,
        invitationIntro: body?.invitationIntro ? String(body.invitationIntro).trim() : undefined,
        invitationRomantic: body?.invitationRomantic ? String(body.invitationRomantic).trim() : undefined,
        invitationHonor: body?.invitationHonor ? String(body.invitationHonor).trim() : undefined,
        invitationFooter: body?.invitationFooter ? String(body.invitationFooter).trim() : undefined,
        invitationValues: body?.invitationValues ? String(body.invitationValues).trim() : undefined,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json({ error: "Erro interno ao criar evento" }, { status: 500 });
  }
}