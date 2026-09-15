import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const body = await request.json().catch(() => ({}));
    const guestName = String(body?.guestName ?? "").trim();
    const text = String(body?.body ?? "").trim();

    if (!guestName || !text) {
      return NextResponse.json(
        { error: "Nome e mensagem são obrigatórios" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        eventId,
        guestName,
        body: text,
        approved: true,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar mensagem:", error);
    return NextResponse.json({ error: "Erro ao salvar mensagem" }, { status: 500 });
  }
}
