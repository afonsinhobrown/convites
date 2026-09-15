import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { normalizeMozPhone } from "@/lib/phone";

const ALLOWED_FIELDS = [
  "brideName",
  "groomName",
  "weddingDate",
  "ceremonyTime",
  "ceremonyVenue",
  "ceremonyAddress",
  "receptionVenue",
  "receptionTime",
  "welcomeMessage",
  "rsvpContact",
  "rsvpDeadline",
  "templateSlug",
  "showGallery",
  "showGifts",
  "showMessages",
  "showCountdown",
  "publishedAt",
] as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const body = await request.json();
    const data: Record<string, unknown> = {};

    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    if (data.weddingDate && typeof data.weddingDate === "string") {
      data.weddingDate = new Date(`${data.weddingDate}T12:00:00`);
    }
    if (data.rsvpDeadline != null && typeof data.rsvpDeadline === "string") {
      data.rsvpDeadline = new Date(`${data.rsvpDeadline}T12:00:00`);
    }
    if (typeof data.rsvpContact === "string" && data.rsvpContact.trim()) {
      data.rsvpContact = normalizeMozPhone(data.rsvpContact.trim()) || data.rsvpContact.trim();
    }
    if (typeof data.welcomeMessage === "string") {
      data.welcomeMessage = data.welcomeMessage.trim() === "" ? null : data.welcomeMessage;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Sem campos para atualizar" }, { status: 400 });
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data,
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar evento" }, { status: 500 });
  }
}