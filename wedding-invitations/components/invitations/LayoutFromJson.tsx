"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  CANVAS,
  FIELD_ORDER,
  getFieldValue,
  type LayoutJson,
} from "@/lib/designer-layout";
import type { InvitationData } from "./types";

function fontStack(f: { fontFamily: string }) {
  return f.fontFamily === "Great Vibes" || f.fontFamily === "Inter"
    ? `"${f.fontFamily}", sans-serif`
    : `"${f.fontFamily}", serif`;
}

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
        {(Object.keys(FIELD_ORDER) as string[]).map((key) => {
          const f = layoutJson[key];
          if (!f) return null;
          return (
            <div
              key={key}
              className="flex items-center justify-center"
              style={{
                position: "absolute",
                left: f.x,
                top: f.y,
                width: f.width,
                height: f.height,
                fontFamily: fontStack(f),
                fontSize: f.fontSize,
                fontWeight: f.fontWeight ?? 400,
                color: f.color,
                textAlign: f.textAlign,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                textTransform: (f as any).textTransform === "uppercase" ? "uppercase" : "none",
                overflow: "hidden",
                lineHeight: 1.1,
              }}
            >
              {getFieldValue(key, data)}
            </div>
          );
        })}
      </div>
    </div>
  );
}