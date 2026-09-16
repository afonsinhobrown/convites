import type { InvitationData } from "@/components/invitations/types";
import { extractTemplateDefaultData } from "@/lib/designer-layout";

// Dados fictícios usados na montra e como fallback dos previews sincronizados com o Designer.
export const DEMO_DATA: InvitationData = {
  guestName: "Lucas Whilo e Esposa",
  brideName: "JÚLIA",
  groomName: "ANTÓNIO",
  day: "08",
  month: "SETEMBRO",
  year: "2027",
  time: "14:00",
  venue: "HOTEL LUZ",
  address: "Av. da Marginal, Maputo",
  rsvpContact: "+258 84 000 0000",
  rsvpDate: "15 de Outubro",
  invitationHeader: "Com a Bênção de Deus",
  invitationIntro: "Temos a alegria de vos convidar para o nosso casamento",
  invitationRomantic: "Duas vidas, dois corações, uma história para toda a vida.",
  invitationHonor: "Será uma honra celebrar este momento tão especial na presença de vocês.",
  invitationFooter: "Juntos para sempre",
  invitationValues: "Amor · Respeito · Companheirismo · Sempre",
};

// Normaliza os dados para o preview na montra, respeitando fielmente o layout desenhado pelo Designer.
export function demoDataToInvitationData(demo: unknown, layoutJson?: unknown): InvitationData {
  if (layoutJson && typeof layoutJson === "object" && Object.keys(layoutJson).length > 0) {
    const extracted = extractTemplateDefaultData({ layoutJson, demoData: demo });
    return {
      guestName: "Lucas Whilo e Esposa",
      brideName: extracted.brideName || "JÚLIA",
      groomName: extracted.groomName || "ANTÓNIO",
      day: "08",
      month: "SETEMBRO",
      year: "2027",
      time: extracted.ceremonyTime || "14:00",
      venue: extracted.ceremonyVenue || "HOTEL LUZ",
      address: extracted.ceremonyAddress || "Av. da Marginal, Maputo",
      rsvpContact: extracted.rsvpContact || "+258 84 000 0000",
      rsvpDate: "15 de Outubro",
      invitationHeader: extracted.invitationHeader || "Com a Bênção de Deus",
      invitationIntro: extracted.invitationIntro || "Temos a alegria de vos convidar para o nosso casamento",
      invitationRomantic: extracted.invitationRomantic || "Duas vidas, dois corações, uma história para toda a vida.",
      invitationHonor: extracted.invitationHonor || "Será uma honra celebrar este momento tão especial na presença de vocês.",
      invitationFooter: extracted.invitationFooter || "Juntos para sempre",
      invitationValues: extracted.invitationValues || "Amor · Respeito · Companheirismo · Sempre",
    };
  }

  const d = (demo && typeof demo === "object" ? demo : {}) as Record<string, unknown>;
  const str = (v: unknown): string | undefined =>
    typeof v === "string" ? v : undefined;

  const base = { ...DEMO_DATA };
  for (const key of Object.keys(base) as (keyof InvitationData)[]) {
    const v = str(d[key]);
    if (v !== undefined) (base as Record<string, unknown>)[key] = v;
  }

  if (d.brideName) base.brideName = str(d.brideName)!;
  if (d.groomName) base.groomName = str(d.groomName)!;
  if (d.locationName) base.venue = str(d.locationName)!;
  if (d.locationAddress) base.address = str(d.locationAddress)!;
  if (d.time) base.time = str(d.time)!;

  return base;
}