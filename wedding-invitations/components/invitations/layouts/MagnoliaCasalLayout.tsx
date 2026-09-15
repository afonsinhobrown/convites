"use client";

import Image from "next/image";
import { AutoFitText } from "../AutoFitText";
import { GuestNameOverlay } from "../GuestNameOverlay";
import type { InvitationData, InvitationMode } from "../types";

export function MagnoliaCasalLayout({
  data,
  mode = "preview",
}: {
  data: InvitationData;
  mode?: InvitationMode;
}) {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[2/3]">
      <Image
        src="/templates/magnolia-casal/fundo.png"
        alt="Convite MagnÃ³lia Casal"
        fill
        priority
        className="object-cover z-0"
      />

<GuestNameOverlay guestName={data.guestName} mode={mode} />

      <div
        className="absolute z-10"
        style={{ top: "20%", left: "48%", right: "3%", textAlign: "center", fontWeight: 700 }}
      >
        <AutoFitText
          text={data.brideName}
          maxFontSize={26}
          minFontSize={20}
          maxLines={2}
          minHeight="72px"
          className="font-serif-custom text-[#1A1A1A]"
        />
      </div>

      <div
        className="absolute z-10"
        style={{ top: "35%", left: "48%", right: "3%", textAlign: "center", fontWeight: 700 }}
      >
        <AutoFitText
          text={data.groomName}
          maxFontSize={26}
          minFontSize={20}
          maxLines={2}
          minHeight="72px"
          className="font-serif-custom text-[#1A1A1A]"
        />
      </div>

      <div className="absolute z-10" style={{ top: "58%", left: "52%", right: "5%" }}>
        <div className="absolute font-serif-custom text-[#1A1A1A]" style={{ left: "0%", width: "36%", textAlign: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: 700 }}>{data.day}</div>
          <div style={{ fontSize: "9px", textTransform: "uppercase" }}>DE {data.month}</div>
          <div style={{ fontSize: "9px", textTransform: "uppercase" }}>DE {data.year}</div>
        </div>
        <div
          className="absolute font-serif-custom text-[#1A1A1A]"
          style={{ left: "40%", width: "25%", textAlign: "center", fontSize: "18px", fontWeight: 700 }}
        >
          {data.time}
        </div>
        <div className="absolute font-serif-custom text-[#1A1A1A]" style={{ left: "68%", width: "32%", textAlign: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: 700 }}>{data.venue}</div>
          {data.address && <div style={{ fontSize: "8px", marginTop: "1px" }}>{data.address}</div>}
        </div>
      </div>

      <div
        className="absolute z-10 font-serif-custom text-[#1A1A1A]"
        style={{ top: "91%", left: "25%", width: "50%", textAlign: "center", fontSize: "12px", fontWeight: 700 }}
      >
        {data.rsvpContact}
        {data.rsvpDate ? ` Â· AtÃ© ${data.rsvpDate}` : ""}
      </div>
    </div>
  );
}
