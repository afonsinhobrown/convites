import { jsPDF } from "jspdf";

interface EventInfo {
  brideName: string;
  groomName: string;
  weddingDateFormatted: string;
  ceremonyVenue: string;
  ceremonyTime: string;
}

interface GuestReportItem {
  name: string;
  phone?: string | null;
  email?: string | null;
  rsvpStatus: string;
  guestsCount: number;
  maxCompanions: number;
  dietaryNotes?: string | null;
  message?: string | null;
  respondedAt?: Date | string | null;
}

interface MessageReportItem {
  guestName: string;
  body: string;
  createdAt: Date | string;
}

interface GiftReportItem {
  type: string;
  label: string;
  details: string;
}

interface WhatsAppLogReportItem {
  recipientName: string;
  recipientPhone: string;
  mode: string;
  status: string;
  sentAt: Date | string;
  messageText: string;
}

function addPdfHeader(doc: jsPDF, event: EventInfo, reportTitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Barra de destaque dourada (#C5A059)
  doc.setFillColor(197, 160, 89);
  doc.rect(0, 0, pageWidth, 8, "F");

  // Título do Evento
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 26);
  doc.text(`${event.brideName} & ${event.groomName}`, pageWidth / 2, 20, { align: "center" });

  // Detalhes do Casamento
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${event.weddingDateFormatted} · ${event.ceremonyTime} · ${event.ceremonyVenue}`,
    pageWidth / 2,
    26,
    { align: "center" }
  );

  // Linha separadora
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, 30, pageWidth - 14, 30);

  // Título do Relatório
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(139, 90, 43); // #8B5A2B tom sépia/ouro
  doc.text(reportTitle, 14, 38);

  // Data de Emissão
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-MZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(`Emitido em: ${dateStr}`, pageWidth - 14, 38, { align: "right" });
}

function addPdfFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Plataforma de Convites de Casamento", 14, pageHeight - 7);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: "right" });
  }
}

/**
 * RELATÓRIO 1: Lista de Confirmados & Presenças (RSVP)
 */
export function generateRsvpReportPdf(event: EventInfo, guests: GuestReportItem[]): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  addPdfHeader(doc, event, "Relatório de Presenças & RSVP");

  // Métricas
  const totalGuests = guests.length;
  const confirmed = guests.filter((g) => g.rsvpStatus === "CONFIRMED");
  const declined = guests.filter((g) => g.rsvpStatus === "DECLINED");
  const totalPeopleConfirmed = confirmed.reduce((acc, g) => acc + (g.guestsCount || 1), 0);

  // Cards de Resumo
  doc.setFillColor(248, 246, 240);
  doc.roundedRect(14, 44, pageWidth - 28, 20, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const colWidth = (pageWidth - 28) / 4;
  doc.text("TOTAL CONVITES", 14 + colWidth * 0.5, 51, { align: "center" });
  doc.text("CONFIRMADOS", 14 + colWidth * 1.5, 51, { align: "center" });
  doc.text("RECUSADOS", 14 + colWidth * 2.5, 51, { align: "center" });
  doc.text("TOTAL PESSOAS", 14 + colWidth * 3.5, 51, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.text(`${totalGuests}`, 14 + colWidth * 0.5, 59, { align: "center" });
  doc.setTextColor(16, 185, 129); // Verde
  doc.text(`${confirmed.length}`, 14 + colWidth * 1.5, 59, { align: "center" });
  doc.setTextColor(239, 68, 68); // Vermelho
  doc.text(`${declined.length}`, 14 + colWidth * 2.5, 59, { align: "center" });
  doc.setTextColor(197, 160, 89); // Dourado
  doc.text(`${totalPeopleConfirmed}`, 14 + colWidth * 3.5, 59, { align: "center" });

  // Tabela de Convidados
  let y = 72;
  const headers = ["Convidado", "Contacto", "Estado", "Pessoas", "Notas / Dieta"];
  const colX = [14, 64, 110, 138, 158];

  function drawTableHeader() {
    doc.setFillColor(197, 160, 89);
    doc.rect(14, y - 5, pageWidth - 28, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    headers.forEach((h, i) => doc.text(h, colX[i], y - 0.5));
    y += 5;
  }

  drawTableHeader();

  guests.forEach((g, idx) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      addPdfHeader(doc, event, "Relatório de Presenças & RSVP (cont.)");
      y = 48;
      drawTableHeader();
    }

    if (idx % 2 === 1) {
      doc.setFillColor(252, 250, 246);
      doc.rect(14, y - 4, pageWidth - 28, 7, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);

    const nameTruncated = g.name.length > 25 ? g.name.substring(0, 23) + "..." : g.name;
    doc.text(nameTruncated, colX[0], y);

    const contact = g.phone || g.email || "-";
    const contactTruncated = contact.length > 22 ? contact.substring(0, 20) + "..." : contact;
    doc.text(contactTruncated, colX[1], y);

    const statusText =
      g.rsvpStatus === "CONFIRMED" ? "Confirmado" : g.rsvpStatus === "DECLINED" ? "Não vai" : "Pendente";
    if (g.rsvpStatus === "CONFIRMED") doc.setTextColor(16, 185, 129);
    else if (g.rsvpStatus === "DECLINED") doc.setTextColor(239, 68, 68);
    else doc.setTextColor(150, 150, 150);
    doc.text(statusText, colX[2], y);

    doc.setTextColor(40, 40, 40);
    doc.text(`${g.rsvpStatus === "CONFIRMED" ? g.guestsCount : 1}`, colX[3], y);

    const notes = g.dietaryNotes || g.message || "-";
    const notesTruncated = notes.length > 28 ? notes.substring(0, 26) + "..." : notes;
    doc.text(notesTruncated, colX[4], y);

    y += 7;
  });

  addPdfFooter(doc);
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * RELATÓRIO 2: Livro de Mensagens dos Convidados
 */
export function generateMessagesReportPdf(event: EventInfo, messages: MessageReportItem[]): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  addPdfHeader(doc, event, "Livro de Mensagens & Votos dos Convidados");

  let y = 48;

  if (messages.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Ainda não foram deixadas mensagens no convite.", pageWidth / 2, 65, { align: "center" });
  } else {
    messages.forEach((msg) => {
      const splitText = doc.splitTextToSize(`"${msg.body}"`, pageWidth - 36);
      const boxHeight = splitText.length * 4.5 + 14;

      if (y + boxHeight > pageHeight - 20) {
        doc.addPage();
        addPdfHeader(doc, event, "Livro de Mensagens (cont.)");
        y = 48;
      }

      // Caixa de Mensagem elegante
      doc.setFillColor(252, 250, 246);
      doc.setDrawColor(220, 205, 175);
      doc.roundedRect(14, y, pageWidth - 28, boxHeight, 2, 2, "FD");

      // Borda decorativa esquerda dourada
      doc.setFillColor(197, 160, 89);
      doc.rect(14, y, 2.5, boxHeight, "F");

      // Nome do Convidado
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(26, 26, 26);
      doc.text(msg.guestName, 20, y + 6);

      // Data
      const dateStr = new Date(msg.createdAt).toLocaleDateString("pt-MZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text(dateStr, pageWidth - 18, y + 6, { align: "right" });

      // Corpo da Mensagem
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text(splitText, 20, y + 12);

      y += boxHeight + 5;
    });
  }

  addPdfFooter(doc);
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * RELATÓRIO 3: Lista de Presentes & Contribuições
 */
export function generateGiftsReportPdf(event: EventInfo, gifts: GiftReportItem[]): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  addPdfHeader(doc, event, "Registo de Presentes & Sugestões");

  let y = 48;

  if (gifts.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Nenhum método de presente ou lista de desejos configurado.", pageWidth / 2, 65, {
      align: "center",
    });
  } else {
    gifts.forEach((gift) => {
      const splitDetails = doc.splitTextToSize(gift.details || "", pageWidth - 36);
      const boxHeight = splitDetails.length * 4.5 + 14;

      if (y + boxHeight > pageHeight - 20) {
        doc.addPage();
        addPdfHeader(doc, event, "Registo de Presentes (cont.)");
        y = 48;
      }

      doc.setFillColor(252, 250, 246);
      doc.setDrawColor(220, 205, 175);
      doc.roundedRect(14, y, pageWidth - 28, boxHeight, 2, 2, "FD");

      doc.setFillColor(197, 160, 89);
      doc.rect(14, y, 2.5, boxHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(139, 90, 43);
      doc.text(`[${gift.type}] ${gift.label}`, 20, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 50);
      doc.text(splitDetails, 20, y + 12);

      y += boxHeight + 5;
    });
  }

  addPdfFooter(doc);
  return Buffer.from(doc.output("arraybuffer"));
}

/**
 * RELATÓRIO 4: Histórico de Envios de WhatsApp
 */
export function generateWhatsAppHistoryPdf(
  event: EventInfo,
  logs: WhatsAppLogReportItem[]
): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  addPdfHeader(doc, event, "Histórico de Disparos WhatsApp");

  let y = 48;
  const headers = ["Data / Hora", "Destinatário", "Contacto", "Modo", "Estado"];
  const colX = [14, 52, 102, 142, 172];

  function drawTableHeader() {
    doc.setFillColor(197, 160, 89);
    doc.rect(14, y - 5, pageWidth - 28, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    headers.forEach((h, i) => doc.text(h, colX[i], y - 0.5));
    y += 5;
  }

  if (logs.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Nenhum envio de WhatsApp registado até ao momento.", pageWidth / 2, 65, {
      align: "center",
    });
  } else {
    drawTableHeader();

    logs.forEach((log, idx) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        addPdfHeader(doc, event, "Histórico de Disparos WhatsApp (cont.)");
        y = 48;
        drawTableHeader();
      }

      if (idx % 2 === 1) {
        doc.setFillColor(252, 250, 246);
        doc.rect(14, y - 4, pageWidth - 28, 7, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);

      const dateStr = new Date(log.sentAt).toLocaleDateString("pt-MZ", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(dateStr, colX[0], y);

      const nameTruncated =
        log.recipientName.length > 24 ? log.recipientName.substring(0, 22) + "..." : log.recipientName;
      doc.text(nameTruncated, colX[1], y);

      doc.text(log.recipientPhone, colX[2], y);

      const modeStr = log.mode === "BULK" ? "Lote Único" : "Individual";
      doc.text(modeStr, colX[3], y);

      doc.setTextColor(16, 185, 129); // Verde
      doc.text("Enviado", colX[4], y);

      y += 7;
    });
  }

  addPdfFooter(doc);
  return Buffer.from(doc.output("arraybuffer"));
}
