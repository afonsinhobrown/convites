"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  CANVAS,
  fontFamilyClass,
  getFieldValueWithSource,
  type LayoutJson,
} from "@/lib/designer-layout";
import type { InvitationData } from "./types";

export function LayoutFromJson({
  layoutJson,
  previewUrl,
  data,
}: {
  layoutJson: LayoutJson;
  previewUrl?: string | null;
  data: InvitationData;
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
            {getFieldValueWithSource(key, f, data)}
          </div>
        ))}
      </div>
    </div>
  );
}