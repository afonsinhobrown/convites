import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const event = await prisma.event.findFirst({
      where: { id: params.id, organizerId },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const logs = await prisma.whatsAppLog.findMany({
      where: { eventId: params.id },
      orderBy: { sentAt: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Erro ao buscar histórico de WhatsApp:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const event = await prisma.event.findFirst({
      where: { id: params.id, organizerId },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { guestId, recipientName, recipientPhone, mode, messageText } = body;

    if (!recipientPhone || !recipientName || !messageText) {
      return NextResponse.json(
        { error: "recipientName, recipientPhone e messageText são obrigatórios" },
        { status: 400 }
      );
    }

    const log = await prisma.whatsAppLog.create({
      data: {
        eventId: params.id,
        guestId: guestId || null,
        recipientName: String(recipientName).trim(),
        recipientPhone: String(recipientPhone).trim(),
        mode: mode === "BULK" ? "BULK" : "INDIVIDUAL",
        status: "SENT",
        messageText: String(messageText).trim(),
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("Erro ao registar envio de WhatsApp:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
