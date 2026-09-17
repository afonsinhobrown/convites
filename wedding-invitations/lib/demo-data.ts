import type { InvitationData } from "@/components/invitations/types";

// Dados de amostra — devem ser IGUAIS ao SAMPLE_DATA do DesignerEditor
// para que a montra mostre exactamente o mesmo que o designer vê.
export const DEMO_DATA: InvitationData = {
  guestName: "SR. ABDUL E SRA. HALIMA",
  brideName: "FATIMA",
  groomName: "OMAR",
  groomArabicName: "OMAR",
  brideArabicName: "FATIMA",
  mosque: "Mesquita Al-Iman",
  mosqueLocation: "RUA DA BEIRA, MAPUTO",
  groomParents: "SR. ALY E SRA. CATIJA",
  brideParents: "Pais da Noiva",
  noivos: "FATIMA & OMAR",
  day: "12",
  month: "DEZEMBRO",
  year: "2026",
  time: "14:00",
  dia1: "01",
  mes1: "02",
  ano1: "27",
  hora1: "14h00",
  data_completa: "08/09/2027",
  data_setembro: "Sábado, 26 de Setembro de 2026",
  data_islao: "14 de Rabīʿ al-Thānī de 1448 H",
  ele_esposa: "Lucas Whilo e Esposa",
  venue: "Mesquita Al-Iman",
  address: "RUA DA BEIRA, MAPUTO",
  locationName: "Mesquita Al-Iman",
  locationAddress: "RUA DA BEIRA, MAPUTO",
  rsvpContact: "+258 84 000 0000",
  rsvpDate: "15 de Outubro",
  invitationHeader: "Com a Bênção de Allah",
  invitationIntro: "Têm a honra de convidar o (a) Senhor (a)",
  invitationRomantic: "A vossa presença será uma grande honra para as nossas famílias.",
  invitationHonor: "Será uma honra celebrar este momento tão especial na presença de vocês.",
  invitationFooter: "Juntos para sempre",
  invitationValues: "FÉ | RESPEITO | AMOR | FAMÍLIA | UNIÃO | SEMPRE",
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