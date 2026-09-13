import Image from "next/image";

interface Palette {
  bg: string;
  border: string;
  accent: string;
  text: string;
  deco: "line" | "heart" | "diamond" | "rings" | "arch";
}

const PALETTES: Record<string, Palette> = {
  "magnolia-gold": { bg: "#FDFBF7", border: "#C5A059", accent: "#8B5A2B", text: "#1A1A1A", deco: "heart" },
  "classic-centered": { bg: "#FFFFFF", border: "#CBD5E1", accent: "#334155", text: "#0F172A", deco: "line" },
  "photo-fullscreen": { bg: "#0B1220", border: "#3B82F6", accent: "#93C5FD", text: "#F9FAFB", deco: "arch" },
  "minimal-banner": { bg: "#FAFAFA", border: "#E5E5E5", accent: "#737373", text: "#171717", deco: "line" },
  "vintage-floral": { bg: "#FBF7F2", border: "#A47053", accent: "#9C6B4F", text: "#3F2A1D", deco: "diamond" },
  "modern-dark": { bg: "#111827", border: "#F59E0B", accent: "#FBBF24", text: "#F3F4F6", deco: "line" },
  "elegant-serif": { bg: "#FDFDFD", border: "#1F2937", accent: "#374151", text: "#111827", deco: "line" },
  "boho-chic": { bg: "#F7F0E8", border: "#C77B54", accent: "#B05B34", text: "#4A2B22", deco: "rings" },
  "royal-blue": { bg: "#EEEBFF", border: "#4F46E5", accent: "#4338CA", text: "#1E1B4B", deco: "diamond" },
  "geometric-rose": { bg: "#FDF2F8", border: "#EC4899", accent: "#BE185D", text: "#500724", deco: "heart" },
};

export function TemplateThumbnail({
  slug,
  name,
  previewUrl,
  className = "",
}: {
  slug: string;
  name: string;
  previewUrl?: string | null;
  className?: string;
}) {
  if (previewUrl) {
    return (
      <Image
        src={previewUrl}
        alt={`Modelo ${name}`}
        width={200}
        height={300}
        className={`w-full object-cover ${className}`}
      />
    );
  }

  const palette = PALETTES[slug] ?? PALETTES["classic-centered"];

  return (
    <svg
      viewBox="0 0 200 300"
      className={`w-full ${className}`}
      role="img"
      aria-label={`Modelo ${name}`}
    >
      <rect width="200" height="300" fill={palette.bg} />
      <rect x="8" y="8" width="184" height="284" fill="none" stroke={palette.border} strokeWidth="2" />
      <rect x="14" y="14" width="172" height="272" fill="none" stroke={palette.border} strokeWidth="0.5" strokeOpacity="0.6" />
      <g textAnchor="middle" fontFamily="Georgia, serif">
        <text x="100" y="70" fontSize="9" letterSpacing="4" fill={palette.accent}>
          CONVITE
        </text>
        <text x="100" y="150" fontSize="26" fill={palette.text} fontWeight="bold">
          N &amp; N
        </text>
        <text x="100" y="190" fontSize="20" fill={palette.accent} fontStyle="italic">
          &amp;
        </text>
        {palette.deco === "line" && (
          <line x1="70" y1="210" x2="130" y2="210" stroke={palette.accent} strokeWidth="1.5" />
        )}
        {palette.deco === "diamond" && (
          <path d="M100 205 L108 213 L100 221 L92 213 Z" fill="none" stroke={palette.accent} strokeWidth="1.5" />
        )}
        {palette.deco === "heart" && (
          <path
            d="M100 218 C94 212 88 216 88 222 C88 229 100 235 100 235 C100 235 112 229 112 222 C112 216 106 212 100 218 Z"
            fill="none"
            stroke={palette.accent}
            strokeWidth="1.5"
          />
        )}
        {palette.deco === "rings" && (
          <g fill="none" stroke={palette.accent} strokeWidth="1.5">
            <circle cx="93" cy="214" r="6" />
            <circle cx="107" cy="214" r="6" />
          </g>
        )}
        {palette.deco === "arch" && (
          <path d="M82 214 A18 18 0 0 1 118 214" fill="none" stroke={palette.accent} strokeWidth="1.5" />
        )}
        <text x="100" y="252" fontSize="9" letterSpacing="3" fill={palette.text} opacity="0.7">
          DE {name.toUpperCase().slice(0, 16)}
        </text>
      </g>
    </svg>
  );
}