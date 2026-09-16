"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Rnd } from "react-rnd";
import { Trash2, Lock, Unlock, Copy } from "lucide-react";
import type { InvitationTemplate } from "@prisma/client";
import {
  CANVAS,
  DEFAULT_LAYOUTS,
  FIELD_ORDER,
  FONT_FAMILIES,
  PRESETS,
  emptyField,
  fieldLabel,
  fontFamilyClass,
  getFieldValueWithSource,
  type FieldKey,
  type LayoutField,
  type LayoutJson,
} from "@/lib/designer-layout";

const SAMPLE_DATA = {
  guestName: "SR. ABDUL E SRA. HALIMA",
  groomArabicName: "OMAR",
  brideArabicName: "FATIMA",
  mosque: "Mesquita Al-Iman",
  mosqueLocation: "RUA DA BEIRA, MAPUTO",
  groomParents: "SR. ALY E SRA. CATIJA",
  brideParents: "Pais da Noiva",
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
  venue: "Mesquita Al-Iman",
  address: "RUA DA BEIRA, MAPUTO",
  locationName: "Mesquita Al-Iman",
  locationAddress: "RUA DA BEIRA, MAPUTO",
  rsvpContact: "+258 84 000 0000",
  rsvpDate: undefined,
};

function defaultLayout(slug: string): LayoutJson {
  const base = DEFAULT_LAYOUTS[slug];
  if (base) {
    const out: LayoutJson = {};
    for (const [k, v] of Object.entries(base)) {
      out[k] = { ...v };
    }
    return out;
  }
  const out: LayoutJson = {};
  for (const key of Object.keys(FIELD_ORDER)) out[key] = emptyField(key);
  return out;
}

function orderedKeys(layout: LayoutJson): FieldKey[] {
  const base = (Object.keys(FIELD_ORDER) as FieldKey[]).filter((k) => k in layout);
  const extra = Object.keys(layout).filter((k) => !Object.keys(FIELD_ORDER).includes(k as FieldKey)) as FieldKey[];
  return [...base, ...extra];
}

export function DesignerEditor({ template }: { template: InvitationTemplate }) {
  const initialJson = useMemo<LayoutJson>(() => {
    const raw = template.layoutJson as LayoutJson | null;
    if (raw && Object.keys(raw).length > 0) {
      const out: LayoutJson = {};
      for (const [k, v] of Object.entries(raw)) out[k] = { ...v };
      return out;
    }
    return defaultLayout(template.slug);
  }, [template.layoutJson, template.slug]);

  const [layout, setLayout] = useState<LayoutJson>(initialJson);
  const [selected, setSelected] = useState<FieldKey>("brideName");
  const [zoom, setZoom] = useState(0.55);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Conteudo: true,
    Tipo: true,
    Posição: true,
    Alinhamento: true,
  });
  const frameRef = useRef<HTMLDivElement>(null);

  function updateField(key: FieldKey, patch: Partial<LayoutField>) {
    setLayout((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function toggleSection(name: string) {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function applyPreset(name: "name" | "phrase" | "label") {
    const style = PRESETS[name].style;
    updateField(selected, { ...style });
  }

  function duplicateSelected() {
    const src = layout[selected as string];
    if (!src) return;
    const baseKey = (selected as string).split("_")[0];
    let n = 1;
    let newKey = `${baseKey}_cop${n}`;
    while (layout[newKey]) {
      n += 1;
      newKey = `${baseKey}_cop${n}`;
    }
    setLayout((prev) => ({
      ...prev,
      [newKey]: {
        ...src,
        x: Math.min(src.x + 30, CANVAS.width - src.width),
        y: Math.min(src.y + 30, CANVAS.height - src.height),
        sourceKey: baseKey,
        locked: false,
      },
    }));
    setSelected(newKey as FieldKey);
  }

  function addField(key: FieldKey) {
    if (layout[key as string]) return;
    setLayout((prev) => ({
      ...prev,
      [key]: emptyField(key),
    }));
    setSelected(key);
  }

  const removeField = useCallback((key: string) => {
    setLayout((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setLayout((curr) => {
      const remaining = orderedKeys(curr).filter((k) => k !== key);
      if (remaining.length > 0) {
        setSelected(remaining[0]);
      }
      return curr;
    });
  }, []);

  function removeSelected() {
    if (!selected) return;
    removeField(selected as string);
  }

  function resetLayout() {
    setLayout(defaultLayout(template.slug));
  }

  // Atalho de Teclado: Delete ou Backspace apaga o componente selecionado
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault();
        removeField(selected as string);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, removeField]);

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
  const fieldStyle = (f: LayoutField) => ({
    fontSize: f.fontSize,
    fontWeight: f.fontWeight ?? 400,
    fontStyle: f.fontStyle ?? "normal",
    color: f.color,
    textAlign: f.textAlign,
    textTransform: f.textTransform ?? "none",
    letterSpacing: f.letterSpacing != null ? `${f.letterSpacing}px` : undefined,
    lineHeight: f.lineHeight ?? 1.1,
    overflow: "hidden",
  });
return (
    <main className="flex h-screen flex-col bg-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div>
          <a
            href="/designer"
            className="mb-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-rose-600"
          >
            ← Todos os templates
          </a>
          <h1 className="text-lg font-semibold text-gray-900">{template.name}</h1>
          <p className="text-xs text-gray-500">slug: {template.slug}</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                template.status === "PUBLISHED"
                  ? "bg-emerald-100 text-emerald-700"
                  : template.status === "ARCHIVED"
                    ? "bg-gray-200 text-gray-600"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {template.status}
            </span>
            {template.status === "PUBLISHED" && template.publishedAt ? (
              <span className="text-[11px] text-gray-400">
                publicado {new Date(template.publishedAt).toLocaleDateString("pt-PT")}
              </span>
            ) : null}
            <button
              onClick={async () => {
                const next = template.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
                const res = await fetch(
                  `/api/designer/templates/${template.slug}/status`,
                  { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) }
                );
                if (res.ok) window.location.reload();
                else alert((await res.json().catch(() => ({}))).error ?? "Erro ao mudar estado");
              }}
              className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {template.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetLayout}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Reset
          </button>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Painel de propriedades */}
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Campos Ativos ({orderedKeys(layout).length})</h2>
          </div>

          {/* Adicionar componente que não está no layout */}
          {(() => {
            const availableToAdd = (Object.keys(FIELD_ORDER) as FieldKey[]).filter((k) => !(k in layout));
            if (availableToAdd.length === 0) return null;
            return (
              <div className="mb-3 rounded-lg border border-dashed border-gray-300 p-2 bg-gray-50">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  + Adicionar componente ao convite:
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addField(e.target.value as FieldKey);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="" disabled>
                    Escolha um componente...
                  </option>
                  {availableToAdd.map((key) => (
                    <option key={key} value={key}>
                      {FIELD_ORDER[key]}
                    </option>
                  ))}
                </select>
              </div>
            );
          })()}

          <div className="mb-5 grid grid-cols-2 gap-1.5">
            {orderedKeys(layout).map((key) => {
              const copied = (key as string).includes("_cop");
              const isSel = selected === key;
              return (
                <div
                  key={key}
                  className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all shadow-sm ${
                    isSel
                      ? "bg-rose-600 text-white shadow-rose-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <button
                    onClick={() => setSelected(key)}
                    className="flex-1 text-left truncate mr-1.5 font-semibold"
                  >
                    {FIELD_ORDER[key] ?? key}
                    {copied ? <span className="opacity-75 text-[10px]"> (cópia)</span> : null}
                    {layout[key as string]?.locked ? " 🔒" : ""}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(key as string);
                    }}
                    className={`rounded p-1 transition flex items-center justify-center ${
                      isSel
                        ? "bg-rose-700/80 hover:bg-rose-800 text-white"
                        : "hover:bg-red-100 text-red-600 opacity-70 group-hover:opacity-100"
                    }`}
                    title={`Apagar componente "${FIELD_ORDER[key] ?? key}"`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            Propriedades — {FIELD_ORDER[selected] ?? selected}
          </h3>
          <div className="space-y-2 text-sm">
            {/* Presets */}
            <div className="grid grid-cols-3 gap-1.5 pb-1">
              {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
                >
                  {PRESETS[name].label}
                </button>
              ))}
            </div>

            {/* Ações do campo */}
            <div className="flex gap-1.5 pb-2">
              <button
                onClick={duplicateSelected}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <Copy className="h-3.5 w-3.5 text-gray-500" />
                Duplicar
              </button>
              <button
                onClick={() => updateField(selected, { locked: !selectedField?.locked })}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                {selectedField?.locked ? <Lock className="h-3.5 w-3.5 text-amber-600" /> : <Unlock className="h-3.5 w-3.5 text-gray-500" />}
                {selectedField?.locked ? "Fixado" : "Livre"}
              </button>
              <button
                onClick={removeSelected}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2 py-2 text-xs font-bold text-red-700 shadow-sm transition-colors hover:bg-red-100 hover:border-red-400"
                title="Apagar este componente do convite (ou prima Delete no teclado)"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                Apagar
              </button>
            </div>

            {/* Conteúdo / Texto */}
            <Section
              title="Texto / Conteúdo"
              open={openSections.Conteudo ?? true}
              onToggle={() => toggleSection("Conteudo")}
            >
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Texto Personalizado
                </label>
                <p className="mb-1 text-[11px] text-gray-500">
                  Escreva um texto fixo (ex: <i>TELMA &amp; LUIS</i>) ou deixe vazio para usar o valor automático do convite.
                </p>
                <textarea
                  rows={2}
                  value={selectedField?.customText ?? ""}
                  placeholder={getFieldValueWithSource(
                    selected,
                    { ...selectedField, customText: undefined },
                    SAMPLE_DATA
                  )}
                  onChange={(e) =>
                    updateField(selected, {
                      customText: e.target.value === "" ? undefined : e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className={selectedField?.customText ? "font-medium text-emerald-600" : "text-gray-500"}>
                    {selectedField?.customText ? "✓ Texto personalizado ativo" : "Usando valor dinâmico padrão"}
                  </span>
                  {selectedField?.customText && (
                    <button
                      type="button"
                      onClick={() => updateField(selected, { customText: undefined })}
                      className="font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                    >
                      Restaurar Dinâmico
                    </button>
                  )}
                </div>
              </div>
            </Section>

            {/* Tipografia */}
            <Section title="Tipografia" open={openSections.Tipo} onToggle={() => toggleSection("Tipo")}>
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
                  <label className="block text-xs text-gray-500">Peso</label>
                  <select
                    value={selectedField?.fontWeight ?? 400}
                    onChange={(e) => {
                      const w = parseInt(e.target.value, 10);
                      updateField(selected, { fontWeight: w === 400 ? undefined : w });
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                  >
                    <option value={400}>400</option>
                    <option value={600}>600</option>
                    <option value={700}>700</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Itálico</label>
                <input
                  type="checkbox"
                  checked={(selectedField?.fontStyle ?? "normal") === "italic"}
                  onChange={(e) =>
                    updateField(selected, { fontStyle: e.target.checked ? "italic" : "normal" })
                  }
                  className="h-4 w-4"
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
              <div>
                <label className="block text-xs text-gray-500">Text-transform</label>
                <select
                  value={selectedField?.textTransform ?? "none"}
                  onChange={(e) =>
                    updateField(selected, {
                      textTransform: e.target.value as LayoutField["textTransform"],
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                >
                  <option value="none">none</option>
                  <option value="uppercase">uppercase</option>
                  <option value="lowercase">lowercase</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500">Letter-spacing (px)</label>
                  <input
                    type="number"
                    value={selectedField?.letterSpacing ?? 0}
                    onChange={(e) =>
                      updateField(selected, { letterSpacing: parseFloat(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Line-height</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedField?.lineHeight ?? 1.1}
                    onChange={(e) => updateField(selected, { lineHeight: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5"
                  />
                </div>
              </div>
            </Section>

            {/* Posição */}
            <Section title="Posição" open={openSections.Posição} onToggle={() => toggleSection("Posição")}>
              <div className="grid grid-cols-2 gap-2">
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
            </Section>

            {/* Alinhamento */}
            <Section title="Alinhamento" open={openSections.Alinhamento} onToggle={() => toggleSection("Alinhamento")}>
              <div>
                <label className="block text-xs text-gray-500">Text-align</label>
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
            </Section>
          </div>
        </aside>

        {/* Cena desenhável */}
        <div className="flex-1 overflow-auto p-6">
          <div
            ref={frameRef}
            className="relative mx-auto overflow-hidden rounded-lg shadow-xl ring-1 ring-gray-200"
            style={{ width: CANVAS.width * zoom, height: CANVAS.height * zoom }}
          >
            <div className="absolute left-0 top-0" style={frameStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={template.previewUrl ?? "/templates/magnolia-classica/fundo.png"}
                alt="Fundo do convite"
                className="pointer-events-none absolute left-0 top-0 select-none"
                style={{ width: CANVAS.width, height: CANVAS.height }}
              />

              {/* Campos arrastáveis */}
              {orderedKeys(layout).map((key) => {
                const f = layout[key as string] as LayoutField;
                const isSelected = selected === key;
                const locked = !!f.locked;
                return (
                  <Rnd
                    key={key}
                    size={{ width: f.width, height: f.height }}
                    position={{ x: f.x, y: f.y }}
                    scale={zoom}
                    bounds="parent"
                    disableDragging={locked}
                    enableResizing={!locked}
                    onDragStop={(_e, d) => updateField(key, { x: d.x, y: d.y })}
                    onResizeStop={(_e, _dir, ref, _delta, pos) =>
                      updateField(key, {
                        width: parseInt(ref.style.width, 10),
                        height: parseInt(ref.style.height, 10),
                        x: pos.x,
                        y: pos.y,
                      })
                    }
                    onDragStart={() => setSelected(key)}
                    onResizeStart={() => setSelected(key)}
                    onMouseDown={() => setSelected(key)}
                    className={isSelected ? "z-20" : "z-10"}
                    style={{
                      border: isSelected ? "2px solid #e11d48" : "1px dashed transparent",
                      cursor: locked ? "default" : undefined,
                    }}
                    resizeHandleStyles={{
                      bottomRight: { background: "#e11d48", borderRadius: 4, width: 12, height: 12 },
                      bottomLeft: { background: "#e11d48", borderRadius: 4, width: 12, height: 12 },
                      topRight: { background: "#e11d48", borderRadius: 4, width: 12, height: 12 },
                      topLeft: { background: "#e11d48", borderRadius: 4, width: 12, height: 12 },
                    }}
                  >
                    <div
                      className="pointer-events-none absolute -top-6 left-0"
                      style={{ zIndex: 50 }}
                    >
                      <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm">
                        {fieldLabel(key)}
                        {(key as string).includes("_cop") ? " (cópia)" : ""}
                      </span>
                    </div>

                    {isSelected && (
                      <div
                        className="absolute -top-7 right-0 flex items-center gap-1 z-50 pointer-events-auto"
                        style={{ zIndex: 60 }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(key as string);
                          }}
                          className="flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-md hover:bg-red-700 transition cursor-pointer"
                          title="Apagar este componente (ou prima Delete no teclado)"
                        >
                          <Trash2 className="h-3 w-3" />
                          Apagar
                        </button>
                      </div>
                    )}
                    <div
                      className={`flex h-full w-full items-center justify-center px-1 ${fontFamilyClass(f.fontFamily)} ${locked ? "opacity-70" : ""}`}
                      style={fieldStyle(f)}
                    >
                      {getFieldValueWithSource(key, f, SAMPLE_DATA)}
                    </div>
                  </Rnd>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-gray-700"
      >
        {title}
        <span className="text-gray-400">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="space-y-2 px-3 pb-3">{children}</div>}
    </div>
  );
}