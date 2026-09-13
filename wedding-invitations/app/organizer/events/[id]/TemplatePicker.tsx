"use client";

import { useState } from "react";
import { TemplateThumbnail } from "@/components/templates/TemplateThumbnail";
import { Check } from "lucide-react";

interface TemplateOption {
  id: string;
  slug: string;
  name: string;
  priceUsdCents: number;
  previewUrl?: string | null;
}

export function TemplatePicker({
  eventId,
  currentSlug,
  templates,
}: {
  eventId: string;
  currentSlug: string;
  templates: TemplateOption[];
}) {
  const [selected, setSelected] = useState(currentSlug);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function select(slug: string) {
    if (slug === selected) return;
    setSaving(slug);
    setError(null);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug: slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao guardar modelo");
      }
      setSelected(slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar modelo");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      {error && (
        <div role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {templates.map((t) => {
          const isSelected = t.slug === selected;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => select(t.slug)}
              disabled={saving !== null}
              className={`relative rounded-2xl border bg-white p-3 text-left shadow-sm transition disabled:cursor-wait disabled:opacity-70 ${
                isSelected ? "border-[#C5A059] ring-2 ring-[#C5A059]" : "border-gray-200 hover:border-[#C5A059]/50"
              }`}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059]">
                  <Check className="h-3.5 w-3.5 text-white" />
                </span>
              )}
              <TemplateThumbnail slug={t.slug} name={t.name} previewUrl={t.previewUrl} className="aspect-[2/3]" />
              <p className="mt-2 text-sm font-medium text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-500">US$ {(t.priceUsdCents / 100).toFixed(2)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}