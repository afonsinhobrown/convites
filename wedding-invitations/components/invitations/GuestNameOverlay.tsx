"use client";

import type { InvitationMode } from "./types";

// Barra do nome do convidado usada pelos layouts React (não-JSON).
//  - preview / for_guest: mostra o nome (se existir)
//  - for_print: mostra uma linha pontilhada para escrever à mão
export function GuestNameOverlay({
  guestName,
  mode = "preview",
  className = "top-[2%]",
}: {
  guestName?: string;
  mode?: InvitationMode;
  className?: string;
}) {
  if (mode === "for_print") {
    return (
      <div
        className={`absolute z-10 font-sans-custom ${className}`}
        style={{
          left: "10%",
          right: "10%",
          textAlign: "center",
          color: "#8B5A2B",
          letterSpacing: "0.15em",
        }}
        data-guest-line
      >
        <span
          className="inline-block"
          style={{
            width: "45%",
            borderBottom: "1px dashed #8B5A2B",
            fontSize: "10px",
          }}
          aria-label="Nome do convidado"
        />
      </div>
    );
  }

  if (!guestName) return null;

  return (
    <div
      className={`absolute z-10 font-sans-custom ${className}`}
      style={{
        left: "10%",
        right: "10%",
        textAlign: "center",
        fontSize: "10px",
        color: "#8B5A2B",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
      }}
    >
      Convidado: {guestName}
    </div>
  );
}