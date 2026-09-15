"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  CANVAS,
  fontFamilyClass,
  getFieldValueWithSource,
  type LayoutJson,
} from "@/lib/designer-layout";
import type { InvitationData, InvitationMode } from "./types";

const isGuestName = (key: string, field?: { sourceKey?: string }) =>
  (field?.sourceKey ?? key) === "guestName";

const isPhotoField = (key: string, field?: { sourceKey?: string }) =>
  (field?.sourceKey ?? key) === "photoLeft" || (field?.sourceKey ?? key) === "photoRight";

function GuestNameRender({
  mode,
  value,
}: {
  mode: InvitationMode;
  value: string;
}) {
  if (mode === "for_print") {
    return (
      <span
        data-guest-line
        className="inline-block"
        style={{
          width: "60%",
          maxWidth: 420,
          borderBottom: "1px dashed rgba(139, 90, 43, 0.55)",
          height: 0,
        }}
        aria-label="Nome do convidado"
      />
    );
  }
  if (mode === "for_guest") {
    return <>{value}</>;
  }
  return <>{value}</>;
}

export function LayoutFromJson({
  layoutJson,
  previewUrl,
  data,
  mode = "preview",
}: {
  layoutJson: LayoutJson;
  previewUrl?: string | null;
  data: InvitationData;
  mode?: InvitationMode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / CANVAS.width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full aspect-[2/3] overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl ?? "/templates/magnolia-classica/fundo.png"}
        alt="Convite"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute left-0 top-0"
        style={{
          width: CANVAS.width,
          height: CANVAS.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {Object.entries(layoutJson).map(([key, f]) => (
          <div
            key={key}
            className={`flex items-center justify-center ${fontFamilyClass(f.fontFamily)}`}
            style={{
              position: "absolute",
              left: f.x,
              top: f.y,
              width: f.width,
              height: f.height,
              fontSize: f.fontSize,
              fontWeight: f.fontWeight ?? 400,
              fontStyle: f.fontStyle ?? "normal",
              color: f.color,
              textAlign: f.textAlign,
              textTransform: f.textTransform ?? "none",
              letterSpacing: f.letterSpacing != null ? `${f.letterSpacing}px` : undefined,
              lineHeight: f.lineHeight ?? 1.1,
              overflow: "hidden",
            }}
          >
            {isPhotoField(key, f) && (() => {
              const url = getFieldValueWithSource(key, f, data);
              if (!url) return null;
              // eslint-disable-next-line @next/next/no-img-element
              return <img src={url} alt="Foto do convite" className="h-full w-full object-cover" />;
            })()}
            {isPhotoField(key, f) ? null : isGuestName(key, f) ? (
              <GuestNameRender mode={mode} value={getFieldValueWithSource(key, f, data)} />
            ) : (
              getFieldValueWithSource(key, f, data)
            )}
          </div>
        ))}
      </div>
    </div>
  );
}