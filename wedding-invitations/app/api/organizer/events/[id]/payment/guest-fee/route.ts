import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { getSystemConfig } from "@/lib/config";
import { createNetShopCharge, getNetShopCharge, type NetShopMethod } from "@/lib/netshop";
import { normalizeMozPhone } from "@/lib/phone";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const event = await prisma.event.findFirst({
      where: { id: params.id, organizerId },
      include: { guests: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    if (!event.templatePaidAt) {
      return NextResponse.json({ error: "O template do evento deve ser pago primeiro." }, { status: 402 });
    }

    const guestCount = event.guests.length;
    if (guestCount === 0) {
      return NextResponse.json({ error: "Adicione convidados antes de pagar a taxa." }, { status: 400 });
    }

    const config = await getSystemConfig();
    const feePerGuestMzn = Math.round(config.invitationFeeCents / 100); // 25 MT

    const body = await request.json().catch(() => ({}));
    const method: NetShopMethod = body.method === "card" ? "card" : "mpesa";
    const phoneRaw = body.phone ? String(body.phone).trim() : event.rsvpContact;
    const phone = normalizeMozPhone(phoneRaw) || phoneRaw;

    const isSandboxActive = Boolean(body.isSandbox) && (config.sandboxEnabled ?? true);
    const totalMzn = isSandboxActive ? 10 : guestCount * feePerGuestMzn;
    const description = isSandboxActive ? "doremi modo sandbox" : undefined;
    const shortId = event.id.replace(/-/g, "").slice(0, 8);
    const timeSuffix = Date.now().toString().slice(-6);
    const reference = isSandboxActive ? `GF_SB_${shortId}_${timeSuffix}` : `GF_${shortId}_${timeSuffix}`;

    const origin = request.headers.get("origin") || request.headers.get("referer") || "https://convites-beta.vercel.app";
    const returnUrl = `${origin}/organizer/events/${event.id}/payment/success?type=guest-fee`;

    const charge = await createNetShopCharge({
      amountMZN: totalMzn,
      reference,
      method,
      msisdn: method === "mpesa" ? phone : undefined,
      returnUrl,
      description,
    });

    // Registar pagamento na BD
    await prisma.payment.create({
      data: {
        eventId: event.id,
        type: "GUEST_FEE",
        amountCents: totalMzn * 100,
        currency: "MZN",
        status: charge.status === "paid" ? "PAID" : "PENDING",
        provider: "netshop",
        providerRef: reference,
        metadata: {
          isSandbox: isSandboxActive,
          description,
        },
        confirmedAt: charge.status === "paid" ? new Date() : null,
      },
    });

    await prisma.event.update({
      where: { id: event.id },
      data: {
        guestFeePaymentRef: reference,
        guestFeePaidAt: charge.status === "paid" ? new Date() : event.guestFeePaidAt,
      },
    });

    return NextResponse.json({
      success: true,
      reference,
      chargeId: charge.id,
      checkoutUrl: charge.checkoutUrl,
      status: charge.status,
      paid: charge.status === "paid" || !!event.guestFeePaidAt,
      totalMzn,
      guestCount,
      isSandbox: isSandboxActive,
    });
  } catch (error) {
    console.error("Erro ao iniciar pagamento da taxa de convidados na NetShop:", error);
    const msg = error instanceof Error ? error.message : "Erro ao processar pagamento";
    const friendlyMsg =
      msg.toLowerCase().includes("validation") ||
      msg.toLowerCase().includes("invalido") ||
      msg.toLowerCase().includes("invalid")
        ? "Erro de validação nos dados de pagamento. Por favor confirme se o número é Vodacom válido (84/85)."
        : msg;
    return NextResponse.json({ error: friendlyMsg }, { status: 400 });
  }
}

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

    if (event.guestFeePaidAt) {
      return NextResponse.json({ paid: true });
    }

    if (event.guestFeePaymentRef) {
      const check = await getNetShopCharge(event.guestFeePaymentRef);
      if (check.paid) {
        await prisma.event.update({
          where: { id: event.id },
          data: {
            guestFeePaidAt: new Date(),
          },
        });
        await prisma.payment.updateMany({
          where: { providerRef: event.guestFeePaymentRef },
          data: { status: "PAID", confirmedAt: new Date() },
        });
        return NextResponse.json({ paid: true });
      }
    }

    return NextResponse.json({ paid: false });
  } catch (error) {
    console.error("Erro ao verificar estado da taxa de convidados:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
