"use client";

import { useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import type { InvitationTemplate } from "@prisma/client";
import {
  CANVAS,
  FIELD_ORDER,
  getFieldValue,
  type FieldKey,
  type LayoutField,
  type LayoutJson,
} from "@/lib/designer-layout";

const SAMPLE_DATA = {
  guestName: "Maria Nhantumbo",
  brideName: "Ana",
  groomName: "Zlatan",
  day: "12",
  month: "DEZEMBRO",
  year: "2026",
  time: "14:00",
  venue: "Praia do Bilene",
  address: "Circuito de Bilene, Gaza",
  rsvpContact: "+258 84 000 0000",
  rsvpDate: undefined,
};

const FONT_FAMILIES = [
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Inter", value: "Inter" },
  { label: "Great Vibes", value: "Great Vibes" },
];

function emptyField(key: string): LayoutField {
  const isName = key === "brideName" || key === "groomName";
  return {
    x: 320,
    y: 100,
    width: 400,
    height: 60,
    fontSize: isName ? 26 : 13,
    fontFamily: isName ? "Playfair Display" : "Inter",
    fontWeight: isName ? 700 : undefined,
    color: "#1A1A1A",
    textAlign: "center",
  };
}

export function DesignerEditor({ template }: { template: InvitationTemplate }) {
  const initialJson = useMemo<LayoutJson>(() => {
    const raw = template.layoutJson as LayoutJson | null;
    const out: LayoutJson = {};
    for (const key of Object.keys(FIELD_ORDER)) {
      out[key] = raw?.[key] ? { ...raw[key] } : emptyField(key);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id]);

  const [layout, setLayout] = useState<LayoutJson>(initialJson);
  const [selected, setSelected] = useState<FieldKey>("brideName");
  const [zoom, setZoom] = useState(0.55);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  function updateField(key: FieldKey, patch: Partial<LayoutField>) {
    setLayout((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/designer/templates/${template.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutJson: layout }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao guardar");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao guardar layout");
    } finally {
      setSaving(false);
    }
  }

  const selectedField = layout[selected as string] as LayoutField;
  const frameStyle = {
    width: CANVAS.width,
    height: CANVAS.height,
    transform: `scale(${zoom})`,
    transformOrigin: "top left",
  };

  const fontStack = (f: LayoutField) =>
    f.fontFamily === "Great Vibes" || f.fontFamily === "Inter"
      ? `"${f.fontFamily}", sans-serif`
      : `"${f.fontFamily}", serif`;

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{template.name}</h1>
          <p className="text-xs text-gray-500">slug: {template.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            Zoom
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
            <span className="w-9 text-right">{Math.round(zoom * 100)}%</span>
          </label>
          {error && <span className="text-xs text-red-600">{error}</span>}
          {saved && <span className="text-xs font-medium text-emerald-600">Guardado ✓</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Cena desenhável */}
        <div className="flex-1 overflow-auto p-6">
          <div
            ref={frameRef}
            className="relative mx-auto overflow-hidden rounded-lg shadow-xl ring-1 ring-gray-200"
            style={{ width: CANVAS.width * zoom, height: CANVAS.height * zoom }}
          >
            <div className="absolute left-0 top-0" style={frameStyle}>
              {/* Fundo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={template.previewUrl ?? "/templates/magnolia-classica/fundo.png"}
                alt="Fundo do convite"
                className="pointer-events-none absolute left-0 top-0 select-none"
                style={{ width: CANVAS.width, height: CANVAS.height }}
              />

              {/* Campos arrastáveis */}
              {(Object.keys(FIELD_ORDER) as FieldKey[]).map((key) => {
                const f = layout[key as string] as LayoutField;
                const isSelected = selected === key;
                return (
                  <Rnd
                    key={key}
                    size={{ width: f.width, height: f.height }}
                    position={{ x: f.x, y: f.y }}
                    scale={zoom}
                    bounds="parent"
                    onDragStop={(_e, d) => updateField(key, { x: d.x, y: d.y })}
                    onResizeStop={(_e, _dir, ref, _delta, pos) =>
                      updateField(key, {
                        width: parseInt(ref.style.width, 10),
                        height: parseInt(ref.style.height, 10),
                        x: pos.x,
                        y: pos.y,
                      })
                    }
                    onMouseDown={() => setSelected(key)}
                    className={isSelected ? "z-20" : "z-10"}
                    style={{ border: isSelected ? "2px solid #e11d48" : "1px dashed transparent" }}
                    resizeHandleStyles={{
                      bottomRight: { background: "#e11d48", borderRadius: 4, width: 12, height: 12 },
                      bottomLeft: { background: "#e11d48", borderRadius: 4, width: 12, height: 12 },
                      topRight: { background: "#e11d48", borderRadius: 4, width: 12, height: 12 },
                      topLeft: { background: "#e11d48", borderRadius: 4, width: 12, height: 12 },
                    }}
                  >
                    <div
                      className="flex h-full w-full items-center justify-center px-1"
                      style={{
                        fontFamily: fontStack(f),
                        fontSize: f.fontSize,
                        fontWeight: f.fontWeight ?? 400,
                        color: f.color,
                        textAlign: f.textAlign,
                        textTransform: f.textTransform === "uppercase" ? "uppercase" : "none",
                        overflow: "hidden",
                      }}
                    >
                      {fieldLabelText(key)}
                    </div>
                  </Rnd>
                );
              })}
            </div>
          </div>
        </div>

        {/* Painel de propriedades */}
        <aside className="w-72 shrink-0 border-l border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Campos</h2>
          <div className="mb-5 grid grid-cols-2 gap-1.5">
            {(Object.keys(FIELD_ORDER) as FieldKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  selected === key
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {FIELD_ORDER[key]}
              </button>
            ))}
          </div>

          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Propriedades — {FIELD_ORDER[selected]}
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs text-gray-500">Família</label>
              <select
                value={selectedField?.fontFamily}
                onChange={(e) => updateField(selected, { fontFamily: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">Tamanho</label>
                <input
                  type="number"
                  value={selectedField?.fontSize}
                  onChange={(e) => updateField(selected, { fontSize: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Cor</label>
                <input
                  type="color"
                  value={selectedField?.color}
                  onChange={(e) => updateField(selected, { color: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500">Alinhamento</label>
              <select
                value={selectedField?.textAlign}
                onChange={(e) =>
                  updateField(selected, { textAlign: e.target.value as LayoutField["textAlign"] })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-200 pt-3">
              <div>
                <label className="block text-xs text-gray-500">X</label>
                <input
                  type="number"
                  value={selectedField?.x}
                  onChange={(e) => updateField(selected, { x: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Y</label>
                <input
                  type="number"
                  value={selectedField?.y}
                  onChange={(e) => updateField(selected, { y: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Largura</label>
                <input
                  type="number"
                  value={selectedField?.width}
                  onChange={(e) => updateField(selected, { width: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Altura</label>
                <input
                  type="number"
                  value={selectedField?.height}
                  onChange={(e) => updateField(selected, { height: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );

  function fieldLabelText(key: FieldKey): string {
    const value = getFieldValue(key, SAMPLE_DATA);
    const label = FIELD_ORDER[key];
    return `${label}: ${value}`;
  }
}