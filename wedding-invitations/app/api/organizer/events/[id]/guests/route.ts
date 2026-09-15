import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { generateSecureToken, generateQrToken, getBaseUrl } from "@/lib/invitation";
import { normalizeMozPhone } from "@/lib/phone";

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

    // Suporte para importação em lote (bulk)
    if (Array.isArray(body?.guests)) {
      const guestsToInsert = [];
      const now = new Date();
      for (const item of body.guests) {
        const n = String(item?.name ?? "").trim();
        if (!n) continue;
        const pRaw = String(item?.phone ?? "").trim() || null;
        const p = pRaw ? normalizeMozPhone(pRaw) || pRaw : null;
        const em = String(item?.email ?? "").trim().toLowerCase() || null;
        const mc = Number.isFinite(Number(item?.maxCompanions))
          ? Math.max(0, Math.floor(Number(item?.maxCompanions)))
          : 0;

        guestsToInsert.push({
          eventId,
          name: n,
          phone: p,
          email: em && EMAIL_RE.test(em) ? em : null,
          maxCompanions: mc,
          secureToken: generateSecureToken(),
          qrToken: generateQrToken(),
          createdAt: now,
          updatedAt: now,
        });
      }

      if (guestsToInsert.length === 0) {
        return NextResponse.json({ error: "Nenhum convidado válido fornecido" }, { status: 400 });
      }

      await prisma.guest.createMany({
        data: guestsToInsert,
      });

      return NextResponse.json({
        count: guestsToInsert.length,
        message: `${guestsToInsert.length} convidados adicionados com sucesso`,
      });
    }

    // Inserção individual clássica
    const name = String(body?.name ?? "").trim();
    const phoneRaw = String(body?.phone ?? "").trim() || null;
    const phone = phoneRaw ? normalizeMozPhone(phoneRaw) || phoneRaw : null;
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