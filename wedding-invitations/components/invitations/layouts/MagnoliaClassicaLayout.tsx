"use client";

import Image from "next/image";
import { AutoFitText } from "../AutoFitText";
import { GuestNameOverlay } from "../GuestNameOverlay";
import type { InvitationData, InvitationMode } from "../types";

export function MagnoliaClassicaLayout({
  data,
  mode = "preview",
}: {
  data: InvitationData;
  mode?: InvitationMode;
}) {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[2/3]">
      <Image
        src="/templates/magnolia-classica/fundo.png"
        alt="Convite MagnÃ³lia ClÃ¡ssica"
        fill
        priority
        className="object-cover z-0"
      />

<GuestNameOverlay guestName={data.guestName} mode={mode} />

      <div
        className="absolute z-10"
        style={{ top: "24%", left: "3%", right: "3%", textAlign: "center", fontWeight: 700 }}
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
        style={{ top: "36%", left: "3%", right: "3%", textAlign: "center", fontWeight: 700 }}
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

      <div className="absolute z-10 font-serif-custom text-[#1A1A1A]" style={{ top: "64%", left: "9%", width: "22%", textAlign: "center" }}>
        <div style={{ fontSize: "20px", fontWeight: 700 }}>{data.day}</div>
        <div style={{ fontSize: "10px", textTransform: "uppercase" }}>DE {data.month}</div>
        <div style={{ fontSize: "10px", textTransform: "uppercase" }}>DE {data.year}</div>
      </div>

      <div
        className="absolute z-10 font-serif-custom text-[#1A1A1A]"
        style={{ top: "64%", left: "40%", width: "20%", textAlign: "center", fontSize: "20px", fontWeight: 700 }}
      >
        {data.time}
      </div>

      <div className="absolute z-10 font-serif-custom text-[#1A1A1A]" style={{ top: "64%", left: "65%", width: "30%", textAlign: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: 700 }}>{data.venue}</div>
        {data.address && <div style={{ fontSize: "9px" }}>{data.address}</div>}
      </div>

      <div
        className="absolute z-10 font-serif-custom text-[#1A1A1A]"
        style={{ top: "91%", left: "25%", width: "50%", textAlign: "center", fontSize: "13px", fontWeight: 700 }}
      >
        {data.rsvpContact}
        {data.rsvpDate ? ` Â· AtÃ© ${data.rsvpDate}` : ""}
      </div>
    </div>
  );
}
