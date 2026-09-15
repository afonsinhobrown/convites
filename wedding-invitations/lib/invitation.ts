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
  const { day, month, year } = formatEventDate(event.weddingDate);
  return {
    brideName: event.brideName,
    groomName: event.groomName,
    day,
    month,
    year,
    time: event.ceremonyTime,
    venue: event.ceremonyVenue,
    address: event.ceremonyAddress,
    rsvpContact: event.rsvpContact,
    rsvpDate: event.rsvpDeadline ? formatRsvpDate(event.rsvpDeadline) : undefined,
    welcomeMessage: event.welcomeMessage ?? undefined,
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