export type InvitationMode = "preview" | "for_print" | "for_guest";

export interface InvitationData {
  guestName?: string;
  groomArabicName?: string;
  brideArabicName?: string;
  mosque?: string;
  mosqueLocation?: string;
  groomParents?: string;
  brideParents?: string;
  brideName: string;
  groomName: string;
  day: string;
  month: string;
  year: string;
  time: string;
  dia1?: string;
  mes1?: string;
  ano1?: string;
  hora1?: string;
  data_completa?: string;
  data_setembro?: string;
  data_islao?: string;
  ele_esposa?: string;
  noivos?: string;
  venue: string;
  address: string;
  locationName?: string;
  locationAddress?: string;
  rsvpContact: string;
  rsvpDate?: string;
  welcomeMessage?: string;
  invitationHeader?: string;
  invitationIntro?: string;
  invitationRomantic?: string;
  invitationHonor?: string;
  invitationFooter?: string;
  invitationValues?: string;
  photoLeft?: string;
  photoRight?: string;
  // Campos dinâmicos definidos pelo designer (ex: brideArabicName_cop1, hora1_cop1, etc.)
  [key: string]: string | undefined;
}