import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { generatePaymentReceiptPdf } from "@/lib/pdf-generator";
import { formatEventDate } from "@/lib/invitation";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") === "guest-fee" ? "GUEST_FEE" : "TEMPLATE";

    const event = await prisma.event.findFirst({
      where: { id: params.id, organizerId },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const payment = await prisma.payment.findFirst({
      where: { eventId: event.id, type, status: "PAID" },
      orderBy: { confirmedAt: "desc" },
    });

    if (!payment) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
    }

    const { day, month, year } = formatEventDate(event.weddingDate);
    const eventInfo = {
      brideName: event.brideName,
      groomName: event.groomName,
      weddingDateFormatted: `${day} de ${month} de ${year}`,
      ceremonyVenue: event.ceremonyVenue,
      ceremonyTime: event.ceremonyTime,
    };

    const paymentInfo = {
      reference: payment.providerRef || payment.id,
      amountMzn: Math.round(payment.amountCents / 100),
      type: payment.type === "TEMPLATE" ? "Pagamento de Modelo de Convite" : "Taxa de Emissão de Convites",
      date: payment.confirmedAt ? new Date(payment.confirmedAt).toISOString() : new Date().toISOString(),
      method: "NetShop (M-Pesa / Cartão)",
    };

    const pdfBuffer = generatePaymentReceiptPdf(eventInfo, paymentInfo);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recibo_${paymentInfo.reference}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Erro ao gerar recibo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
