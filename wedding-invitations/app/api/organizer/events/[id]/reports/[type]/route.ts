import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { formatEventDate } from "@/lib/invitation";
import {
  generateRsvpReportPdf,
  generateMessagesReportPdf,
  generateGiftsReportPdf,
  generateWhatsAppHistoryPdf,
} from "@/lib/pdf-generator";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { id: string; type: string } }
) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const event = await prisma.event.findFirst({
      where: { id: params.id, organizerId },
      include: {
        guests: { orderBy: { name: "asc" } },
        messages: { orderBy: { createdAt: "desc" } },
        gifts: { orderBy: { sortOrder: "asc" } },
        whatsAppLogs: { orderBy: { sentAt: "desc" } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const { day, month, year } = formatEventDate(event.weddingDate);
    const eventInfo = {
      brideName: event.brideName,
      groomName: event.groomName,
      weddingDateFormatted: `${day} de ${month.toLowerCase()} de ${year}`,
      ceremonyVenue: event.ceremonyVenue,
      ceremonyTime: event.ceremonyTime,
    };

    let pdfBuffer: Buffer;
    let filename = `relatorio_${params.type}_${event.id}.pdf`;

    switch (params.type) {
      case "rsvp":
        pdfBuffer = generateRsvpReportPdf(eventInfo, event.guests);
        filename = `relatorio_presencas_rsvp_${event.brideName}_${event.groomName}.pdf`;
        break;

      case "messages":
        pdfBuffer = generateMessagesReportPdf(eventInfo, event.messages);
        filename = `livro_mensagens_${event.brideName}_${event.groomName}.pdf`;
        break;

      case "gifts":
        pdfBuffer = generateGiftsReportPdf(eventInfo, event.gifts);
        filename = `registo_presentes_${event.brideName}_${event.groomName}.pdf`;
        break;

      case "whatsapp":
        pdfBuffer = generateWhatsAppHistoryPdf(eventInfo, event.whatsAppLogs);
        filename = `historico_whatsapp_${event.brideName}_${event.groomName}.pdf`;
        break;

      default:
        return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
    }

    // Normalizar nome do ficheiro para caracteres seguros
    const safeFilename = filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório PDF:", error);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
