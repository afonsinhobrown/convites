import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { generateSecureToken, generateQrToken, getBaseUrl } from "@/lib/invitation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim() || null;
    const email = String(body?.email ?? "").trim().toLowerCase() || null;
    const maxCompanions = Number.isFinite(Number(body?.maxCompanions))
      ? Math.max(0, Math.floor(Number(body?.maxCompanions)))
      : 0;

    if (!name) {
      return NextResponse.json({ error: "O nome do convidado é obrigatório" }, { status: 400 });
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const guest = await prisma.guest.create({
      data: {
        eventId,
        name,
        phone,
        email,
        maxCompanions,
        secureToken: generateSecureToken(),
        qrToken: generateQrToken(),
      },
    });

    const baseUrl = getBaseUrl();
    return NextResponse.json(
      {
        id: guest.id,
        name: guest.name,
        secureToken: guest.secureToken,
        inviteUrl: `${baseUrl}/invite/${guest.secureToken}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao adicionar convidado:", error);
    return NextResponse.json({ error: "Erro interno ao adicionar convidado" }, { status: 500 });
  }
}