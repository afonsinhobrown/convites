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