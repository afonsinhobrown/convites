export type InvitationMode = "preview" | "for_print" | "for_guest";

export interface InvitationData {
  guestName?: string;
  brideName: string;
  groomName: string;
  day: string;
  month: string;
  year: string;
  time: string;
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
}