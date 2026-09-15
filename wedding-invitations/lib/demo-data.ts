import type { InvitationData } from "@/components/invitations/types";

// Dados fictícios usados na montra e como fallback dos previews.
export const DEMO_DATA: InvitationData = {
  guestName: "Convidado Exemplo",
  brideName: "Ana",
  groomName: "Zlatan",
  day: "24",
  month: "OUTUBRO",
  year: "2026",
  time: "15:30",
  venue: "Quinta dos Coqueiros",
  address: "Av. da Marginal, Maputo",
  rsvpContact: "+258 84 123 4567",
  rsvpDate: "15 de Outubro",
  invitationHeader: "Com a Bênção de Deus",
  invitationIntro: "Temos a alegria de vos convidar para o nosso casamento",
  invitationRomantic: "Duas vidas, dois corações, uma história para toda a vida.",
  invitationHonor: "Será uma honra celebrar este momento tão especial na presença de vocês.",
  invitationFooter: "Juntos para sempre",
  invitationValues: "Amor · Respeito · Companheirismo · Sempre",
};

// Normaliza um valor demoData (Json) armazenado no template para InvitationData.
// O campo aceita tanto as chaves InvitationData (venue/address) quanto as
// chaves usadas no designer (locationName/locationAddress).
export function demoDataToInvitationData(demo: unknown): InvitationData | null {
  if (!demo || typeof demo !== "object") return null;
  const d = demo as Record<string, unknown>;
  const str = (v: unknown): string | undefined =>
    typeof v === "string" ? v : undefined;

  const base = { ...DEMO_DATA };
  for (const key of Object.keys(base) as (keyof InvitationData)[]) {
    const v = str(d[key]);
    if (v !== undefined) (base as Record<string, unknown>)[key] = v;
  }

  if (!base.brideName) base.brideName = str(d.brideName) ?? "Ana";
  if (!base.groomName) base.groomName = str(d.groomName) ?? "Zlatan";

  // Compatibilidade com chaves do designer
  if (!base.venue) base.venue = str(d.locationName) ?? base.venue;
  if (!base.address) base.address = str(d.locationAddress) ?? base.address;
  if (!base.month) base.month = str(d.month) ?? "OUTUBRO";
  if (!base.year) base.year = str(d.year) ?? "2026";
  if (!base.day) base.day = str(d.day) ?? "24";
  if (!base.time) base.time = str(d.time) ?? "15:30";
  if (!base.rsvpContact) base.rsvpContact = str(d.rsvpContact) ?? base.rsvpContact;

  return base;
}