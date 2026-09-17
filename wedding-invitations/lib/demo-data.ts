import type { InvitationData } from "@/components/invitations/types";

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

// Normaliza os dados para o preview na montra.
// Principio: o customText está dentro do layoutJson e é lido directamente pelo LayoutFromJson.
// Esta função só fornece valores de exemplo para campos DINÂMICOS (sem customText).
export function demoDataToInvitationData(demo: unknown): InvitationData {
  const d = (demo && typeof demo === "object" ? demo : {}) as Record<string, unknown>;
  const str = (v: unknown): string | undefined =>
    typeof v === "string" && v && v !== "undefined" ? v : undefined;

  // Começar com os dados padrão de exemplo
  const base: InvitationData = { ...DEMO_DATA };

  // Sobrescrever com TODOS os campos do demoData do template
  // (inclui customText persistidos: brideArabicName, groomArabicName, hora1_cop1, etc.)
  // SEM remapear — cada campo é o que é.
  for (const [key, val] of Object.entries(d)) {
    const v = str(val);
    if (v !== undefined) {
      (base as Record<string, string | undefined>)[key] = v;
    }
  }

  return base;
}