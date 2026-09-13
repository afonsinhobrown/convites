export type TextAlign = "left" | "center" | "right";

export interface LayoutField {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight?: number;
  color: string;
  textAlign: TextAlign;
  textTransform?: "uppercase" | "none";
}

export type LayoutJson = Record<string, LayoutField>;

export type FieldKey = keyof typeof FIELD_ORDER;

export const FIELD_ORDER = {
  guestName: "Convidado",
  brideName: "Noiva",
  groomName: "Noivo",
  day: "Dia",
  month: "Mês",
  year: "Ano",
  time: "Hora",
  locationName: "Nome do local",
  locationAddress: "Morada do local",
  rsvpContact: "Contacto RSVP",
};

const BOLD = { fontWeight: 700 as const };

function f(
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  fontFamily: string,
  color: string,
  extra?: Partial<LayoutField>
): LayoutField {
  return {
    x,
    y,
    width,
    height,
    fontSize,
    fontFamily,
    color,
    textAlign: extra?.textAlign ?? "center",
    ...extra,
  };
}

const serif = "Playfair Display";
const sans = "Inter";

// Base 1024x1536 (as imagens fornecidas)
// Os fontSize estão em unidades deste canvas (1024 de largura).
// No render final o convite ocupa ~416px (scale ~0.40625), por isso
// os valores aqui são os visuais × (1024/416) ≈ ×2.46.
const BASE_W = 1024;
const BASE_H = 1536;

// Visual pretendido (aprovado nos layouts): nomes 26px, dia/hora 20px,
// mês/ano 10px, local 11px, morada 9px, RSVP 13px, convidado 10px.
const S = BASE_W / 416; // ≈ 2.4615
const FX = {
  guestName: 10 * S, // ≈ 25
  name: 26 * S, // ≈ 64
  day: 20 * S, // ≈ 49
  small: 10 * S, // ≈ 25
  time: 20 * S, // ≈ 49
  location: 11 * S, // ≈ 27
  address: 9 * S, // ≈ 22
  rsvp: 13 * S, // ≈ 32
};

function guestNameRow(): LayoutField {
  return f(257, 30, 510, 44, FX.guestName, sans, "#8B5A2B", {
    textTransform: "uppercase",
  });
}

// Magnolia Clássica — nomes centrados, dados em 3 colunas centrais
const classicCenter = {
  baselineRows: (): Record<string, LayoutField> => ({
    day: f(92, 983, 225, 66, FX.day, serif, "#1A1A1A", BOLD),
    month: f(92, 1049, 225, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    year: f(92, 1083, 225, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    time: f(410, 983, 204, 66, FX.time, serif, "#1A1A1A", BOLD),
    locationName: f(666, 983, 307, 44, FX.location, serif, "#1A1A1A", BOLD),
    locationAddress: f(666, 1027, 307, 40, FX.address, sans, "#1A1A1A"),
  }),
};

export const DEFAULT_LAYOUTS: Record<string, LayoutJson> = {
  "magnolia-classica": {
    guestName: guestNameRow(),
    brideName: f(31, 369, 962, 160, FX.name, serif, "#1A1A1A", BOLD),
    groomName: f(31, 553, 962, 160, FX.name, serif, "#1A1A1A", BOLD),
    day: classicCenter.baselineRows().day,
    month: classicCenter.baselineRows().month,
    year: classicCenter.baselineRows().year,
    time: classicCenter.baselineRows().time,
    locationName: classicCenter.baselineRows().locationName,
    locationAddress: classicCenter.baselineRows().locationAddress,
    rsvpContact: f(257, 1398, 510, 44, FX.rsvp, serif, "#1A1A1A", BOLD),
  },
  "magnolia-casal": {
    guestName: guestNameRow(),
    brideName: f(491, 307, 502, 160, FX.name, serif, "#1A1A1A", BOLD),
    groomName: f(491, 538, 502, 160, FX.name, serif, "#1A1A1A", BOLD),
    day: f(491, 891, 181, 66, FX.day, serif, "#1A1A1A", BOLD),
    month: f(491, 957, 181, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    year: f(491, 991, 181, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    time: f(692, 891, 126, 66, FX.time, serif, "#1A1A1A", BOLD),
    locationName: f(833, 891, 160, 44, FX.location, serif, "#1A1A1A", BOLD),
    locationAddress: f(833, 935, 160, 40, FX.address, sans, "#1A1A1A"),
    rsvpContact: f(257, 1398, 510, 44, FX.rsvp, serif, "#1A1A1A", BOLD),
  },
  "magnolia-organica": {
    guestName: guestNameRow(),
    brideName: f(491, 369, 502, 160, FX.name, serif, "#1A1A1A", BOLD),
    groomName: f(491, 568, 502, 160, FX.name, serif, "#1A1A1A", BOLD),
    day: f(491, 922, 181, 66, FX.day, serif, "#1A1A1A", BOLD),
    month: f(491, 988, 181, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    year: f(491, 1022, 181, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    time: f(692, 922, 126, 66, FX.time, serif, "#1A1A1A", BOLD),
    locationName: f(833, 922, 160, 44, FX.location, serif, "#1A1A1A", BOLD),
    locationAddress: f(833, 966, 160, 40, FX.address, sans, "#1A1A1A"),
    rsvpContact: f(257, 1398, 510, 44, FX.rsvp, serif, "#1A1A1A", BOLD),
  },
};

export const CANVAS = { width: BASE_W, height: BASE_H };

// Valores que são renderizados com prefixo "DE " (mês/ano) conforme imagens
export function fieldLabel(key: string): string {
  return FIELD_ORDER[key as FieldKey] ?? key;
}

export function getFieldValue(key: string, data: {
  guestName?: string;
  brideName: string;
  groomName: string;
  day: string;
  month: string;
  year: string;
  time: string;
  venue: string;
  address: string;
  rsvpContact: string;
  rsvpDate?: string;
}): string {
  switch (key) {
    case "guestName":
      return `Convidado: ${data.guestName ?? ""}`.trim();
    case "brideName":
      return data.brideName;
    case "groomName":
      return data.groomName;
    case "day":
      return data.day;
    case "month":
      return `DE ${data.month}`;
    case "year":
      return `DE ${data.year}`;
    case "time":
      return data.time;
    case "locationName":
      return data.venue;
    case "locationAddress":
      return data.address;
    case "rsvpContact":
      return data.rsvpDate ? `${data.rsvpContact} · Até ${data.rsvpDate}` : data.rsvpContact;
    default:
      return "";
  }
}