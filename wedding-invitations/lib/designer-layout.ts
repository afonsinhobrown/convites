export type TextAlign = "left" | "center" | "right";
export type TextTransform = "none" | "uppercase" | "lowercase";

export interface LayoutField {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  color: string;
  textAlign: TextAlign;
  textTransform?: TextTransform;
  letterSpacing?: number;
  lineHeight?: number;
  sourceKey?: string;
  locked?: boolean;
  customText?: string;
}

export type LayoutJson = Record<string, LayoutField>;

export type FieldKey = keyof typeof FIELD_ORDER;

export const FIELD_ORDER = {
  guestName: "Convidado",
  invitationHeader: "Cabeçalho",
  groomArabicName: "Nome Árabe Masculino",
  brideArabicName: "Nome Árabe Feminino",
  groomParents: "Pais do Noivo",
  brideParents: "Pais da Noiva",
  brideName: "Noiva",
  groomName: "Noivo",
  noivos: "Noivos (FATIMA & OMAR)",
  noivos_julia_antonio: "Noivos (JÚLIA & ANTÓNIO)",
  mosque: "Mesquita",
  mosqueLocation: "Local da Mesquita",
  invitationIntro: "Introdução",
  day: "Dia",
  month: "Mês",
  year: "Ano",
  time: "Hora",
  dia1: "Dia (01)",
  mes1: "Mês (02)",
  ano1: "Ano (27)",
  hora1: "Hora (14h00)",
  data_completa: "Data Completa (08/09/2027)",
  data_setembro: "Data Extensa (Sábado, 26 de Setembro de 2026)",
  data_islao: "Data Islâmica (14 de Rabīʿ al-Thānī de 1448 H)",
  ele_esposa: "Ele e Esposa (Lucas Whilo e Esposa)",
  invitationRomantic: "Frase romântica",
  locationName: "Nome do local",
  locationAddress: "Morada do local",
  invitationHonor: "Homenagem",
  invitationFooter: "Rodapé",
  invitationValues: "Valores",
  rsvpContact: "Contacto RSVP",
  photoLeft: "Foto da noiva",
  photoRight: "Foto do noivo",
};

export const FONT_FAMILIES = [
  { label: "Playfair Display", value: "Playfair Display", clue: "Serifada elegante" },
  { label: "Alex Brush", value: "Alex Brush", clue: "Cursiva manuscrita fluida" },
  { label: "Great Vibes", value: "Great Vibes", clue: "Cursiva romântica" },
  { label: "Parisienne", value: "Parisienne", clue: "Cursiva sofisticada" },
  { label: "Pinyon Script", value: "Pinyon Script", clue: "Cursiva formal" },
  { label: "Allura", value: "Allura", clue: "Cursiva suave" },
  { label: "Inter", value: "Inter", clue: "Sans-serif moderna" },
  { label: "Cormorant Garamond", value: "Cormorant Garamond", clue: "Serifada clássica" },
  { label: "Montserrat", value: "Montserrat", clue: "Sans-serif" },
  { label: "Lora", value: "Lora", clue: "Serifada" },
];

export const PRESETS = {
  name: {
    label: "Estilo de Nome",
    style: {
      fontFamily: "Playfair Display",
      fontSize: 64,
      fontWeight: 700,
      color: "#1A1A1A",
      textTransform: "none" as TextTransform,
      letterSpacing: 0,
    },
  },
  phrase: {
    label: "Estilo de Frase",
    style: {
      fontFamily: "Great Vibes",
      fontSize: 39,
      fontWeight: 400,
      color: "#8B5A2B",
      textTransform: "none" as TextTransform,
      letterSpacing: 0,
    },
  },
  label: {
    label: "Estilo de Label",
    style: {
      fontFamily: "Inter",
      fontSize: 25,
      fontWeight: 600,
      color: "#8B5A2B",
      textTransform: "uppercase" as TextTransform,
      letterSpacing: 5,
    },
  },
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
export const FX = {
  guestName: 10 * S, // ≈ 25
  name: 26 * S, // ≈ 64
  day: 20 * S, // ≈ 49
  small: 10 * S, // ≈ 25
  time: 20 * S, // ≈ 49
  location: 11 * S, // ≈ 27
  address: 9 * S, // ≈ 22
  rsvp: 13 * S, // ≈ 32
};

// Fonte default por tipo de campo (ao adicionar/duplicar)
export function defaultFontFor(key: string): string {
  if (
    key === "guestName" ||
    key === "invitationHeader" ||
    key === "invitationIntro" ||
    key === "invitationValues" ||
    key === "mosqueLocation"
  ) {
    return "Inter";
  }
  if (
    key === "invitationRomantic" ||
    key === "invitationHonor" ||
    key === "invitationFooter" ||
    key === "groomParents" ||
    key === "brideParents"
  ) {
    return "Great Vibes";
  }
  if (key === "ele_esposa") {
    return "Alex Brush";
  }
  return "Playfair Display";
}

export function emptyField(key: string): LayoutField {
  const isName =
    key === "brideName" ||
    key === "groomName" ||
    key === "noivos" ||
    key === "groomArabicName" ||
    key === "brideArabicName";
  const isPhoto = key === "photoLeft" || key === "photoRight";
  const family = defaultFontFor(key);
  return {
    x: isPhoto ? (key === "photoLeft" ? 220 : 540) : 312,
    y: isPhoto ? 450 : 200,
    width: isPhoto ? 240 : 400,
    height: isPhoto ? 320 : isName ? 160 : 60,
    fontSize: isName || key === "day" || key === "time" ? FX.name : FX.small,
    fontFamily: family,
    fontWeight: isName ? 700 : undefined,
    color: "#1A1A1A",
    textAlign: "center",
  };
}

function guestNameRow(): LayoutField {
  return f(257, 30, 510, 44, FX.guestName, sans, "#8B5A2B", {
    textTransform: "uppercase",
    letterSpacing: 5,
  });
}

function headerRow(y: number): LayoutField {
  return f(257, y, 510, 44, FX.small, sans, "#8B5A2B", {
    textTransform: "uppercase",
    letterSpacing: 5,
    fontWeight: 600,
  });
}

function introRow(y: number): LayoutField {
  return f(257, y, 510, 72, 25, sans, "#1A1A1A");
}

function romanticRow(y: number): LayoutField {
  return f(257, y, 510, 62, 39, "Great Vibes", "#8B5A2B");
}

function honorRow(y: number): LayoutField {
  return f(257, y, 510, 48, 32, "Great Vibes", "#1A1A1A");
}

function footerRow(y: number): LayoutField {
  return f(257, y, 510, 40, 32, "Great Vibes", "#1A1A1A");
}

function valuesRow(y: number): LayoutField {
  return f(257, y, 510, 36, FX.small, sans, "#8B5A2B", {
    textTransform: "uppercase",
    letterSpacing: 4,
    fontWeight: 600,
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
    invitationHeader: headerRow(120),
    brideName: f(31, 369, 962, 160, FX.name, serif, "#1A1A1A", BOLD),
    groomName: f(31, 553, 962, 160, FX.name, serif, "#1A1A1A", BOLD),
    invitationIntro: introRow(760),
    day: classicCenter.baselineRows().day,
    month: classicCenter.baselineRows().month,
    year: classicCenter.baselineRows().year,
    time: classicCenter.baselineRows().time,
    invitationRomantic: romanticRow(840),
    locationName: classicCenter.baselineRows().locationName,
    locationAddress: classicCenter.baselineRows().locationAddress,
    invitationHonor: honorRow(1180),
    invitationFooter: footerRow(1250),
    invitationValues: valuesRow(1310),
    rsvpContact: f(257, 1398, 510, 44, FX.rsvp, serif, "#1A1A1A", BOLD),
  },
  "magnolia-casal": {
    guestName: guestNameRow(),
    invitationHeader: headerRow(120),
    brideName: f(491, 307, 502, 160, FX.name, serif, "#1A1A1A", BOLD),
    groomName: f(491, 538, 502, 160, FX.name, serif, "#1A1A1A", BOLD),
    invitationIntro: introRow(760),
    day: f(491, 891, 181, 66, FX.day, serif, "#1A1A1A", BOLD),
    month: f(491, 957, 181, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    year: f(491, 991, 181, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    time: f(692, 891, 126, 66, FX.time, serif, "#1A1A1A", BOLD),
    invitationRomantic: romanticRow(840),
    locationName: f(833, 891, 160, 44, FX.location, serif, "#1A1A1A", BOLD),
    locationAddress: f(833, 935, 160, 40, FX.address, sans, "#1A1A1A"),
    invitationHonor: honorRow(1180),
    invitationFooter: footerRow(1250),
    invitationValues: valuesRow(1310),
    rsvpContact: f(257, 1398, 510, 44, FX.rsvp, serif, "#1A1A1A", BOLD),
  },
  "magnolia-organica": {
    guestName: guestNameRow(),
    invitationHeader: headerRow(120),
    brideName: f(491, 369, 502, 160, FX.name, serif, "#1A1A1A", BOLD),
    groomName: f(491, 568, 502, 160, FX.name, serif, "#1A1A1A", BOLD),
    invitationIntro: introRow(790),
    day: f(491, 922, 181, 66, FX.day, serif, "#1A1A1A", BOLD),
    month: f(491, 988, 181, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    year: f(491, 1022, 181, 34, FX.small, serif, "#1A1A1A", {
      textTransform: "uppercase",
    }),
    time: f(692, 922, 126, 66, FX.time, serif, "#1A1A1A", BOLD),
    invitationRomantic: romanticRow(870),
    locationName: f(833, 922, 160, 44, FX.location, serif, "#1A1A1A", BOLD),
    locationAddress: f(833, 966, 160, 40, FX.address, sans, "#1A1A1A"),
    invitationHonor: honorRow(1210),
    invitationFooter: footerRow(1280),
    invitationValues: valuesRow(1340),
    rsvpContact: f(257, 1398, 510, 44, FX.rsvp, serif, "#1A1A1A", BOLD),
  },
};

export const CANVAS = { width: BASE_W, height: BASE_H };

// Classe CSS correspondente a uma família (as fontes são carregadas via
// next/font e aplicadas por CSS variables; por isso nada de font-family inline).
export function fontFamilyClass(fontFamily: string): string {
  switch (fontFamily) {
    case "Playfair Display":
      return "font-serif-custom";
    case "Alex Brush":
      return "font-alex-brush";
    case "Great Vibes":
      return "font-cursive-custom";
    case "Parisienne":
      return "font-parisienne";
    case "Inter":
      return "font-sans-custom";
    case "Cormorant Garamond":
      return "font-cormorant";
    case "Pinyon Script":
      return "font-pinyon";
    case "Allura":
      return "font-allura";
    case "Montserrat":
      return "font-montserrat";
    case "Lora":
      return "font-lora";
    default:
      return "font-sans-custom";
  }
}

export const DESIGNER_SAMPLE_DATA: Record<string, string> = {
  guestName: "Lucas Whilo e Esposa",
  groomArabicName: "OMAR",
  brideArabicName: "FATIMA",
  mosque: "Mesquita Al-Iman",
  mosqueLocation: "RUA DA BEIRA, MAPUTO",
  groomParents: "SR. ALY E SRA. CATIJA",
  brideParents: "SR. FARUK E SRA. AYESHA",
  brideName: "FATIMA",
  groomName: "OMAR",
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
  noivos: "FATIMA & OMAR",
  noivos_julia_antonio: "JÚLIA & ANTÓNIO",
  venue: "HOTEL LUZ",
  address: "Av. da Marginal, Maputo",
  locationName: "HOTEL LUZ",
  locationAddress: "Av. da Marginal, Maputo",
  rsvpContact: "+258 84 000 0000",
  rsvpDate: "15 de Outubro",
  invitationHeader: "Com a Bênção de Deus",
  invitationIntro: "Temos a alegria de vos convidar para o nosso casamento",
  invitationRomantic: "Duas vidas, dois corações, uma história para toda a vida.",
  invitationHonor: "Será uma honra celebrar este momento tão especial na presença de vocês.",
  invitationFooter: "Juntos para sempre",
  invitationValues: "Amor · Respeito · Companheirismo · Sempre",
};

// Valores que são renderizados com prefixo "DE " (mês/ano) conforme imagens
export function fieldLabel(key: string): string {
  return FIELD_ORDER[key as FieldKey] ?? key;
}

function dataValue(key: string, data: Record<string, string | undefined>): string {
  const realKey = data.sourceKey || key;
  switch (realKey) {
    case "guestName":
      return data.guestName || "Lucas Whilo e Esposa";
    case "groomArabicName":
      return data.groomArabicName || "OMAR";
    case "brideArabicName":
      return data.brideArabicName || "FATIMA";
    case "mosque":
      return data.mosque || data.mosqueName || "Mesquita Al-Iman";
    case "mosqueLocation":
      return data.mosqueLocation || data.mosqueAddress || "RUA DA BEIRA, MAPUTO";
    case "groomParents":
      return data.groomParents || "SR. ALY E SRA. CATIJA";
    case "brideParents":
      return data.brideParents || "Pais da Noiva";
    case "brideName":
      return data.brideName ?? "";
    case "groomName":
      return data.groomName ?? "";
    case "day":
      return data.day ?? "";
    case "dia1":
      return data.dia1 || "01";
    case "month":
      return data.month ? `DE ${data.month}` : "DE DEZEMBRO";
    case "mes1":
      return data.mes1 || "02";
    case "year":
      return data.year ? `DE ${data.year}` : "DE 2026";
    case "ano1":
      return data.ano1 || "27";
    case "time":
      return data.time || "14:00";
    case "hora1":
      return data.hora1 || "14:00";
    case "data_completa":
      return data.data_completa || "08/09/2027";
    case "data_setembro":
      return data.data_setembro || "Sábado, 26 de Setembro de 2026";
    case "data_islao":
      return data.data_islao || "14 de Rabīʿ al-Thānī de 1448 H";
    case "ele_esposa":
      return data.ele_esposa || "Lucas Whilo e Esposa";
    case "noivos":
      return (
        data.noivos ||
        (data.brideName && data.groomName && data.brideName !== "Ana" && data.groomName !== "Zlatan"
          ? `${data.brideName} & ${data.groomName}`
          : "FATIMA & OMAR")
      );
    case "noivos_julia_antonio":
      return "JÚLIA & ANTÓNIO";
    case "locationName":
      return data.locationName ?? data.venue ?? "HOTEL LUZ";
    case "locationAddress":
      return data.locationAddress ?? data.address ?? "Av. da Marginal, Maputo";
    case "invitationHeader":
      return data.invitationHeader ?? "Com a Bênção de Deus";
    case "invitationIntro":
      return data.invitationIntro ?? "Temos a alegria de vos convidar para o nosso casamento";
    case "invitationRomantic":
      return data.invitationRomantic ?? "Duas vidas, dois corações, uma história para toda a vida.";
    case "invitationHonor":
      return data.invitationHonor ?? "Será uma honra celebrar este momento tão especial na presença de vocês.";
    case "invitationFooter":
      return data.invitationFooter ?? "Juntos para sempre";
    case "invitationValues":
      return data.invitationValues ?? "Amor · Respeito · Companheirismo · Sempre";
    case "rsvpContact":
      return data.rsvpDate ? `${data.rsvpContact ?? "+258 84 000 0000"} · Até ${data.rsvpDate}` : (data.rsvpContact ?? "+258 84 000 0000");
    case "photoLeft":
      return data.photoLeft ?? "";
    case "photoRight":
      return data.photoRight ?? "";
    default:
      return `${fieldLabel(realKey)}`;
  }
}

export type InvitationFieldData = {
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
};

export function getFieldValue(key: string, data: InvitationFieldData): string {
  return dataValue(key, data as unknown as Record<string, string | undefined>);
}

export function getFieldValueWithSource(
  key: string,
  field: LayoutField | undefined,
  data: InvitationFieldData
): string {
  const ct = field?.customText;
  if (ct !== undefined && ct !== null && ct !== "" && ct !== "undefined") {
    return ct;
  }
  const realKey = field?.sourceKey || key;
  const base = { ...data, sourceKey: undefined } as unknown as Record<string, string | undefined>;
  return dataValue(realKey, base);
}

export interface ActiveTemplateFields {
  hasCouple: boolean;
  hasBrideName: boolean;
  hasGroomName: boolean;
  hasGroomArabicName: boolean;
  hasBrideArabicName: boolean;
  hasGroomParents: boolean;
  hasBrideParents: boolean;
  hasEleEsposa: boolean;
  hasDate: boolean;
  hasTime: boolean;
  hasVenue: boolean;
  hasAddress: boolean;
  hasRsvp: boolean;
  hasHeader: boolean;
  hasIntro: boolean;
  hasRomantic: boolean;
  hasHonor: boolean;
  hasFooter: boolean;
  hasValues: boolean;
  hasPhotos: boolean;
  totalActive: number;
}

export function getTemplateActiveFields(
  layoutJson?: unknown,
  slug?: string
): ActiveTemplateFields {
  let layout: LayoutJson = {};
  if (layoutJson && typeof layoutJson === "object" && Object.keys(layoutJson).length > 0) {
    layout = layoutJson as LayoutJson;
  } else if (slug && DEFAULT_LAYOUTS[slug]) {
    layout = DEFAULT_LAYOUTS[slug];
  }

  const rawKeys = Object.keys(layout);
  if (rawKeys.length === 0) {
    // Fallback padrão se o layout estiver vazio
    return {
      hasCouple: true,
      hasBrideName: true,
      hasGroomName: true,
      hasGroomArabicName: false,
      hasBrideArabicName: false,
      hasGroomParents: false,
      hasBrideParents: false,
      hasEleEsposa: false,
      hasDate: true,
      hasTime: true,
      hasVenue: true,
      hasAddress: true,
      hasRsvp: true,
      hasHeader: false,
      hasIntro: false,
      hasRomantic: true,
      hasHonor: false,
      hasFooter: false,
      hasValues: false,
      hasPhotos: false,
      totalActive: 0,
    };
  }

  const activeKeys = new Set<string>();
  for (const [key, field] of Object.entries(layout)) {
    const realKey = field?.sourceKey || key.split("_")[0];
    activeKeys.add(realKey);
    activeKeys.add(key);
  }

  const has = (k: string) => activeKeys.has(k);

  return {
    hasCouple: has("noivos"),
    hasBrideName: has("brideName"),
    hasGroomName: has("groomName"),
    hasGroomArabicName: has("groomArabicName"),
    hasBrideArabicName: has("brideArabicName"),
    hasGroomParents: has("groomParents"),
    hasBrideParents: has("brideParents"),
    hasEleEsposa: has("ele_esposa"),
    hasDate:
      has("day") ||
      has("month") ||
      has("year") ||
      has("dia1") ||
      has("mes1") ||
      has("ano1") ||
      has("data_completa") ||
      has("data_setembro") ||
      has("data_islao"),
    hasTime: has("time") || has("hora1"),
    hasVenue: has("locationName") || has("venue") || has("mosque"),
    hasAddress: has("locationAddress") || has("address") || has("mosqueLocation"),
    hasRsvp: has("rsvpContact"),
    hasHeader: has("invitationHeader"),
    hasIntro: has("invitationIntro"),
    hasRomantic: has("invitationRomantic") || has("welcomeMessage"),
    hasHonor: has("invitationHonor"),
    hasFooter: has("invitationFooter"),
    hasValues: has("invitationValues"),
    hasPhotos: has("photoLeft") || has("photoRight"),
    totalActive: rawKeys.length,
  };
}

export function extractTemplateDefaultData(template: {
  slug?: string;
  layoutJson?: unknown;
  demoData?: unknown;
}) {
  let layout: LayoutJson = {};
  if (template.layoutJson && typeof template.layoutJson === "object" && Object.keys(template.layoutJson).length > 0) {
    layout = template.layoutJson as LayoutJson;
  } else if (template.slug && DEFAULT_LAYOUTS[template.slug]) {
    layout = DEFAULT_LAYOUTS[template.slug];
  }

  const demo = (template.demoData && typeof template.demoData === "object" ? template.demoData : {}) as Record<string, unknown>;

  const getCustom = (key: string): string | undefined => {
    const f = layout[key];
    if (f?.customText && f.customText.trim()) return f.customText.trim();
    for (const [k, v] of Object.entries(layout)) {
      if ((v?.sourceKey === key || k.startsWith(`${key}_`)) && v?.customText && v.customText.trim()) {
        return v.customText.trim();
      }
    }
    return undefined;
  };

  const coupleText =
    getCustom("noivos") ||
    (typeof demo.noivos === "string" ? demo.noivos : undefined) ||
    (layout.noivos ? "FATIMA & OMAR" : undefined);

  let brideFromCouple = "";
  let groomFromCouple = "";
  if (coupleText && (coupleText.includes("&") || coupleText.includes(" e "))) {
    const parts = coupleText.includes("&") ? coupleText.split("&") : coupleText.split(" e ");
    brideFromCouple = parts[0]?.trim() || "";
    groomFromCouple = parts[1]?.trim() || "";
  }

  const brideName =
    getCustom("brideName") ||
    brideFromCouple ||
    (typeof demo.brideName === "string" && demo.brideName ? demo.brideName : "FATIMA");

  const groomName =
    getCustom("groomName") ||
    groomFromCouple ||
    (typeof demo.groomName === "string" && demo.groomName ? demo.groomName : "OMAR");

  const ceremonyVenue =
    getCustom("locationName") ||
    getCustom("venue") ||
    getCustom("mosque") ||
    (typeof demo.venue === "string" && demo.venue ? demo.venue : "") ||
    (typeof demo.locationName === "string" && demo.locationName ? demo.locationName : "") ||
    "HOTEL LUZ";

  const ceremonyAddress =
    getCustom("locationAddress") ||
    getCustom("address") ||
    getCustom("mosqueLocation") ||
    (typeof demo.address === "string" && demo.address ? demo.address : "") ||
    (typeof demo.locationAddress === "string" && demo.locationAddress ? demo.locationAddress : "") ||
    "Av. da Marginal, Maputo";

  const rsvpContact =
    getCustom("rsvpContact") ||
    (typeof demo.rsvpContact === "string" && demo.rsvpContact ? demo.rsvpContact : "+258 84 000 0000");

  const ceremonyTime =
    getCustom("time") ||
    getCustom("hora1") ||
    (typeof demo.time === "string" && demo.time ? demo.time : "14:00");

  const invitationHeader =
    getCustom("invitationHeader") ||
    (typeof demo.invitationHeader === "string" && demo.invitationHeader ? demo.invitationHeader : "Com a Bênção de Deus");

  const invitationIntro =
    getCustom("invitationIntro") ||
    (typeof demo.invitationIntro === "string" && demo.invitationIntro ? demo.invitationIntro : "Temos a alegria de vos convidar para o nosso casamento");

  const invitationRomantic =
    getCustom("invitationRomantic") ||
    (typeof demo.invitationRomantic === "string" && demo.invitationRomantic ? demo.invitationRomantic : "Duas vidas, dois corações, uma história para toda a vida.");

  const invitationHonor =
    getCustom("invitationHonor") ||
    (typeof demo.invitationHonor === "string" && demo.invitationHonor ? demo.invitationHonor : "Será uma honra celebrar este momento tão especial na presença de vocês.");

  const invitationFooter =
    getCustom("invitationFooter") ||
    (typeof demo.invitationFooter === "string" && demo.invitationFooter ? demo.invitationFooter : "Juntos para sempre");

  const invitationValues =
    getCustom("invitationValues") ||
    (typeof demo.invitationValues === "string" && demo.invitationValues ? demo.invitationValues : "Amor · Respeito · Companheirismo · Sempre");

  // Recolher TODOS os campos com customText definido pelo designer para persistir no demoData
  // Isto garante que qualquer campo personalizado (ex: brideArabicName, groomArabicName, hora1, etc.)
  // seja preservado fielmente mesmo que não esteja listado explicitamente acima.
  const allCustomFields: Record<string, string> = {};
  for (const [k, v] of Object.entries(layout)) {
    if (v?.customText && v.customText.trim() && v.customText !== "undefined") {
      allCustomFields[k] = v.customText.trim();
    }
  }

  return {
    // Campos personalizados do designer (prevalecem sobre tudo)
    ...allCustomFields,
    // Campos padrão mapeados
    brideName,
    groomName,
    weddingDate: "2027-09-08",
    ceremonyTime,
    ceremonyVenue,
    ceremonyAddress,
    rsvpContact,
    welcomeMessage: invitationRomantic,
    invitationHeader,
    invitationIntro,
    invitationRomantic,
    invitationHonor,
    invitationFooter,
    invitationValues,
  };
}