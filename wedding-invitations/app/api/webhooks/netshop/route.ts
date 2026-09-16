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
  const data = (body.data || body.charge || body) as Record<string, unknown>;

  const status = String(data.status || body.status || "").toLowerCase();
  const isPaid = event === "charge.paid" || status === "paid" || status === "succeeded";

  if (isPaid) {
    const reference =
      (typeof data.reference === "string" && data.reference ? data.reference : "") ||
      (typeof data.order_id === "string" && data.order_id ? data.order_id : "") ||
      (typeof body.reference === "string" && body.reference ? body.reference : "") ||
      (typeof body.order_id === "string" && body.order_id ? body.order_id : "") ||
      undefined;

    const chargeId = (typeof data.id === "string" && data.id ? data.id : "") || (typeof body.id === "string" && body.id ? body.id : "") || undefined;

    if (reference || chargeId) {
      // 1. Pagamento de Template (TPL_...)
      if (reference && reference.startsWith("TPL_")) {
        const rawId = reference.replace(/^TPL_(SANDBOX_)?/, "").split("_")[0];
        const ev = await prisma.event.findFirst({
          where: {
            OR: [
              { templatePaymentRef: reference },
              { id: rawId },
            ],
          },
        });

        if (ev) {
          const isSandboxPayment = reference.includes("SANDBOX");
          await prisma.event.update({
            where: { id: ev.id },
            data: {
              templatePaidAt: new Date(),
              templatePaymentRef: reference,
              isSandbox: isSandboxPayment,
            },
          });

          await prisma.payment.updateMany({
            where: {
              OR: [
                { providerRef: reference },
                { eventId: ev.id, type: "TEMPLATE", status: "PENDING" },
              ],
            },
            data: { status: "PAID", confirmedAt: new Date() },
          });

          console.log(`[NetShop] Pagamento de template confirmado para o evento ${ev.id} (${reference})`);
        }
      }

      // 2. Taxa de Convidados (GFEE_...)
      if (reference && reference.startsWith("GFEE_")) {
        const rawId = reference.replace(/^GFEE_(SANDBOX_)?/, "").split("_")[0];
        const ev = await prisma.event.findFirst({
          where: {
            OR: [
              { guestFeePaymentRef: reference },
              { id: rawId },
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
            where: {
              OR: [
                { providerRef: reference },
                { eventId: ev.id, type: "GUEST_FEE", status: "PENDING" },
              ],
            },
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
