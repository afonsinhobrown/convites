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
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    if (event.templatePaidAt) {
      return NextResponse.json({ message: "Template já se encontra pago", paid: true });
    }

    const [template, config] = await Promise.all([
      prisma.invitationTemplate.findUnique({ where: { slug: event.templateSlug } }),
      getSystemConfig(),
    ]);

    if (!template) {
      return NextResponse.json({ error: "Modelo de convite não encontrado" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const method: NetShopMethod = body.method === "card" ? "card" : "mpesa";
    const phoneRaw = body.phone ? String(body.phone).trim() : event.rsvpContact;
    const phone = normalizeMozPhone(phoneRaw) || phoneRaw;

    const priceMzn = Math.round((template.priceUsdCents / 100) * config.bimExchangeRate);
    const reference = `TPL_${event.id}_${Date.now()}`;

    const origin = request.headers.get("origin") || request.headers.get("referer") || "https://convites-beta.vercel.app";
    const returnUrl = `${origin}/organizer/events/${event.id}?paid=1`;

    const charge = await createNetShopCharge({
      amountMZN: priceMzn,
      reference,
      method,
      msisdn: method === "mpesa" ? phone : undefined,
      returnUrl,
    });

    // Registar pagamento na BD
    await prisma.payment.create({
      data: {
        eventId: event.id,
        type: "TEMPLATE",
        amountCents: priceMzn * 100,
        currency: "MZN",
        status: charge.status === "paid" ? "PAID" : "PENDING",
        provider: "netshop",
        providerRef: reference,
        confirmedAt: charge.status === "paid" ? new Date() : null,
      },
    });

    await prisma.event.update({
      where: { id: event.id },
      data: {
        templatePaymentRef: reference,
        templatePaidAt: charge.status === "paid" ? new Date() : null,
        isSandbox: charge.status === "paid" ? false : event.isSandbox,
      },
    });

    return NextResponse.json({
      success: true,
      reference,
      chargeId: charge.id,
      checkoutUrl: charge.checkoutUrl,
      status: charge.status,
      paid: charge.status === "paid",
    });
  } catch (error) {
    console.error("Erro ao iniciar pagamento de template na NetShop:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao processar pagamento" },
      { status: 500 }
    );
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

    if (event.templatePaidAt) {
      return NextResponse.json({ paid: true });
    }

    // Se tiver uma referência pendente, verifica na NetShop em fallback
    if (event.templatePaymentRef) {
      const check = await getNetShopCharge(event.templatePaymentRef);
      if (check.paid) {
        await prisma.event.update({
          where: { id: event.id },
          data: {
            templatePaidAt: new Date(),
            isSandbox: false,
          },
        });
        await prisma.payment.updateMany({
          where: { providerRef: event.templatePaymentRef },
          data: { status: "PAID", confirmedAt: new Date() },
        });
        return NextResponse.json({ paid: true });
      }
    }

    return NextResponse.json({ paid: false });
  } catch (error) {
    console.error("Erro ao verificar estado do pagamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
