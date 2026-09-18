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

    const isSandboxActive = Boolean(body.isSandbox) && (config.sandboxEnabled ?? true);

    if (isSandboxActive) {
      const existingSandboxEvent = await prisma.event.findFirst({
        where: {
          organizerId,
          isSandbox: true,
          id: { not: event.id },
          templatePaidAt: { not: null },
        },
      });
      if (existingSandboxEvent) {
        return NextResponse.json(
          { error: "O modo Sandbox permite apenas 1 evento de teste por promotor. Para novos eventos, realize o pagamento em modo Live." },
          { status: 400 }
        );
      }
    }

    const priceMzn = isSandboxActive ? 10 : Math.round((template.priceUsdCents / 100) * config.bimExchangeRate);
    const description = isSandboxActive ? "doremi modo sandbox" : undefined;
    const shortId = event.id.replace(/-/g, "").slice(0, 8);
    const timeSuffix = Date.now().toString().slice(-6);
    const reference = isSandboxActive ? `TPL_SB_${shortId}_${timeSuffix}` : `TPL_${shortId}_${timeSuffix}`;

    const origin = request.headers.get("origin") || request.headers.get("referer") || "https://convites-beta.vercel.app";
    const returnUrl = `${origin}/organizer/events/${event.id}/payment/success?type=template`;

    const charge = await createNetShopCharge({
      amountMZN: priceMzn,
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
        type: "TEMPLATE",
        amountCents: priceMzn * 100,
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
        templatePaymentRef: reference,
        templatePaidAt: charge.status === "paid" ? new Date() : null,
        isSandbox: isSandboxActive,
      },
    });

    return NextResponse.json({
      success: true,
      reference,
      chargeId: charge.id,
      checkoutUrl: charge.checkoutUrl,
      status: charge.status,
      paid: charge.status === "paid",
      isSandbox: isSandboxActive,
      amountMzn: priceMzn,
    });
  } catch (error) {
    console.error("Erro ao iniciar pagamento de template na NetShop:", error);
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
