import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyNetShopWebhookSignature } from "@/lib/netshop";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature =
    req.headers.get("x-netshop-signature") ||
    req.headers.get("x-webhook-signature") ||
    req.headers.get("x-signature") ||
    req.headers.get("signature");

  if (process.env.NETSHOP_WEBHOOK_SECRET && signature) {
    const isValid = verifyNetShopWebhookSignature(raw, signature);
    if (!isValid) {
      console.warn("NetShop Webhook: Assinatura HMAC inválida");
      return NextResponse.json({ received: true, error: "invalid signature" }, { status: 400 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ received: true, error: "invalid json" }, { status: 400 });
  }

  const event = String(body.event || body.type || "");
  const data = (body.data || body) as Record<string, unknown>;

  if (event === "charge.paid" || data.status === "paid" || data.status === "succeeded") {
    const reference = typeof data.reference === "string" ? data.reference : undefined;
    if (reference) {
      // 1. Pagamento de Template (TPL_...)
      if (reference.startsWith("TPL_")) {
        const ev = await prisma.event.findFirst({
          where: {
            OR: [
              { templatePaymentRef: reference },
              { id: reference.replace(/^TPL_/, "").split("_")[0] },
            ],
          },
        });

        if (ev) {
          await prisma.event.update({
            where: { id: ev.id },
            data: {
              templatePaidAt: new Date(),
              templatePaymentRef: reference,
              isSandbox: false,
            },
          });

          await prisma.payment.updateMany({
            where: { providerRef: reference },
            data: { status: "PAID", confirmedAt: new Date() },
          });

          console.log(`[NetShop] Pagamento de template confirmado para o evento ${ev.id} (${reference})`);
        }
      }

      // 2. Taxa de Convidados (GFEE_...)
      if (reference.startsWith("GFEE_")) {
        const ev = await prisma.event.findFirst({
          where: {
            OR: [
              { guestFeePaymentRef: reference },
              { id: reference.replace(/^GFEE_/, "").split("_")[0] },
            ],
          },
        });

        if (ev) {
          await prisma.event.update({
            where: { id: ev.id },
            data: {
              guestFeePaidAt: new Date(),
              guestFeePaymentRef: reference,
            },
          });

          await prisma.payment.updateMany({
            where: { providerRef: reference },
            data: { status: "PAID", confirmedAt: new Date() },
          });

          console.log(`[NetShop] Taxa de convidados confirmada para o evento ${ev.id} (${reference})`);
        }
      }

      // 3. Fallback genérico por providerRef em Payment
      const payment = await prisma.payment.findFirst({
        where: { providerRef: reference, status: "PENDING" },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", confirmedAt: new Date() },
        });

        if (payment.type === "TEMPLATE") {
          await prisma.event.update({
            where: { id: payment.eventId },
            data: {
              templatePaidAt: new Date(),
              templatePaymentRef: reference,
              isSandbox: false,
            },
          });
        } else if (payment.type === "GUEST_FEE") {
          await prisma.event.update({
            where: { id: payment.eventId },
            data: {
              guestFeePaidAt: new Date(),
              guestFeePaymentRef: reference,
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true, ok: true }, { status: 200 });
}
