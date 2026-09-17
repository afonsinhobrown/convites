import { randomBytes } from "crypto";
import { headers } from "next/headers";
import type { Event } from "@prisma/client";
import type { InvitationData } from "@/components/invitations/types";

const MONTHS_PT = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
];

const MONTHS_PT_LABEL = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS_PT = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function generateSecureToken(): string {
  return randomBytes(24).toString("hex");
}

export function generateQrToken(): string {
  return randomBytes(12).toString("hex");
}

export function formatEventDate(date: Date): { day: string; month: string; year: string } {
  const d = new Date(date);
  return {
    day: String(d.getDate()),
    month: MONTHS_PT[d.getMonth()],
    year: String(d.getFullYear()),
  };
}

export function formatRsvpDate(date: Date): string {
  const d = new Date(date);
  return `${d.getDate()} de ${MONTHS_PT_LABEL[d.getMonth()]}`;
}

export function eventToInvitationData(event: Event): InvitationData {
  const d = event.weddingDate ?? new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTHS_PT[d.getMonth()] ?? d.toLocaleDateString("pt-PT", { month: "long" }).toUpperCase();
  const year = String(d.getFullYear());
  const weekday = WEEKDAYS_PT[d.getDay()] ?? "Sábado";
  const monthLabel = MONTHS_PT_LABEL[d.getMonth()] ?? "Setembro";

  return {
    brideName: event.brideName ?? "",
    groomName: event.groomName ?? "",
    groomArabicName: event.groomName ?? "OMAR",
    brideArabicName: event.brideName ?? "FATIMA",
    mosque: event.ceremonyVenue ?? "Mesquita Al-Iman",
    mosqueLocation: event.ceremonyAddress ?? "RUA DA BEIRA, MAPUTO",
    groomParents: "SR. ALY E SRA. CATIJA",
    brideParents: "Pais da Noiva",
    day,
    month,
    year,
    time: event.ceremonyTime ?? "",
    dia1: day || "01",
    mes1: String(d.getMonth() + 1).padStart(2, "0") || "02",
    ano1: String(d.getFullYear()).slice(-2) || "27",
    hora1: event.ceremonyTime ? (event.ceremonyTime.includes("h") ? event.ceremonyTime : event.ceremonyTime.replace(":", "h")) : "14h00",
    data_completa: `${day}/${String(d.getMonth() + 1).padStart(2, "0")}/${year}`,
    data_setembro: `${weekday}, ${d.getDate()} de ${monthLabel} de ${year}`,
    data_islao: "14 de Rabīʿ al-Thānī de 1448 H",
    ele_esposa: `${event.groomName ?? "Lucas Whilo"} e Esposa`,
    noivos: event.brideName && event.groomName ? `${event.brideName} & ${event.groomName}` : "FATIMA & OMAR",
    locationName: event.ceremonyVenue ?? "",
    locationAddress: event.ceremonyAddress ?? "",
    venue: event.ceremonyVenue ?? "",
    address: event.ceremonyAddress ?? "",
    rsvpContact: event.rsvpContact ?? "",
    guestName: "", // preenchido depois no contexto do convidado
    rsvpDate: event.rsvpDeadline ? formatRsvpDate(event.rsvpDeadline) : undefined,
    welcomeMessage: event.welcomeMessage ?? undefined,
    invitationHeader: event.invitationHeader ?? "Com a Bênção de Deus",
    invitationIntro: event.invitationIntro ?? "Temos a alegria de vos convidar para o nosso casamento",
    invitationRomantic: event.invitationRomantic ?? "Duas vidas, dois corações, uma história para toda a vida.",
    invitationHonor: event.invitationHonor ?? "Será uma honra celebrar este momento tão especial na presença de vocês.",
    invitationFooter: event.invitationFooter ?? "Juntos para sempre",
    invitationValues: event.invitationValues ?? "Amor · Respeito · Companheirismo · Sempre",
    photoLeft: event.photoLeft ?? undefined,
    photoRight: event.photoRight ?? undefined,
  };
}

export function getBaseUrl(): string {
  const host = headers().get("host");
  const proto = headers().get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}