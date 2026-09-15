"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplatePreview } from "@/components/invitations/TemplatePreview";
import { Check, Sparkles } from "lucide-react";

interface TemplateItem {
  id: string;
  slug: string;
  name: string;
  priceUsdCents: number;
  previewUrl?: string | null;
  componentName: string;
  layoutJson?: unknown;
  demoData?: unknown;
}

interface NewEventFormProps {
  initialTemplateSlug: string;
  templates: TemplateItem[];
  defaultValues: {
    brideName: string;
    groomName: string;
    weddingDate: string;
    ceremonyTime: string;
    ceremonyVenue: string;
    ceremonyAddress: string;
    rsvpContact: string;
    welcomeMessage: string;
  };
}

export function NewEventForm({
  initialTemplateSlug,
  templates,
  defaultValues,
}: NewEventFormProps) {
  const router = useRouter();
  const [templateSlug, setTemplateSlug] = useState(initialTemplateSlug);
  const [form, setForm] = useState(defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedTemplate =
    templates.find((t) => t.slug === templateSlug) ?? templates[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/organizer/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          templateSlug,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar e personalizar o convite");
        return;
      }

      // Redireciona diretamente para o painel de gestão do evento criado
      router.push(`/organizer/events/${data.id}`);
      router.refresh();
    } catch {
      setError("Erro de ligação ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SELECÇÃO DO MODELO */}
      <div className="rounded-2xl border border-[#C5A059]/20 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              1. Modelo selecionado
            </h2>
            <p className="text-sm text-gray-500">
              Pode confirmar ou alterar o modelo antes de prosseguir
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#C5A059]/10 px-3 py-1 text-xs font-semibold text-[#8B5A2B]">
            <Sparkles className="h-3.5 w-3.5" />
            {selectedTemplate?.name}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {templates.map((t) => {
            const isSelected = t.slug === templateSlug;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplateSlug(t.slug)}
                className={`relative rounded-2xl border bg-white p-2.5 text-left shadow-sm transition ${
                  isSelected
                    ? "border-[#C5A059] ring-2 ring-[#C5A059]"
                    : "border-gray-200 hover:border-[#C5A059]/50"
                }`}
              >
                {isSelected && (
                  <span className="absolute right-2 top-2 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C5A059]">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </span>
                )}
                <TemplatePreview
                  slug={t.slug}
                  name={t.name}
                  componentName={t.componentName}
                  previewUrl={t.previewUrl}
                  layoutJson={t.layoutJson}
                  demoData={t.demoData}
                  className="aspect-[2/3]"
                />
                <p className="mt-2 text-xs font-medium text-gray-900 truncate">
                  {t.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* FORMULÁRIO PRÉ-PREENCHIDO COM DEMO DATA */}
      <div className="rounded-2xl border border-[#C5A059]/20 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          2. Personalizar dados do casamento
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Os campos foram pré-preenchidos com os dados de exemplo do modelo.
          Substitua com os seus dados reais.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="brideName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome da noiva
              </label>
              <input
                id="brideName"
                type="text"
                required
                value={form.brideName}
                onChange={(e) => update("brideName", e.target.value)}
                placeholder="Ex: Ana"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="groomName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome do noivo
              </label>
              <input
                id="groomName"
                type="text"
                required
                value={form.groomName}
                onChange={(e) => update("groomName", e.target.value)}
                placeholder="Ex: Zlatan"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="weddingDate"
                className="block text-sm font-medium text-gray-700"
              >
                Data do casamento
              </label>
              <input
                id="weddingDate"
                type="date"
                required
                value={form.weddingDate}
                onChange={(e) => update("weddingDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="ceremonyTime"
                className="block text-sm font-medium text-gray-700"
              >
                Hora da cerimónia
              </label>
              <input
                id="ceremonyTime"
                type="time"
                required
                value={form.ceremonyTime}
                onChange={(e) => update("ceremonyTime", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ceremonyVenue"
                className="block text-sm font-medium text-gray-700"
              >
                Nome do local
              </label>
              <input
                id="ceremonyVenue"
                type="text"
                required
                value={form.ceremonyVenue}
                onChange={(e) => update("ceremonyVenue", e.target.value)}
                placeholder="Ex: Quinta dos Coqueiros"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="ceremonyAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Endereço / Morada
              </label>
              <input
                id="ceremonyAddress"
                type="text"
                value={form.ceremonyAddress}
                onChange={(e) => update("ceremonyAddress", e.target.value)}
                placeholder="Ex: Av. da Marginal, Maputo"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="rsvpContact"
              className="block text-sm font-medium text-gray-700"
            >
              Contacto RSVP
            </label>
            <input
              id="rsvpContact"
              type="text"
              required
              value={form.rsvpContact}
              onChange={(e) => update("rsvpContact", e.target.value)}
              placeholder="Ex: +258 84 123 4567"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="welcomeMessage"
              className="block text-sm font-medium text-gray-700"
            >
              Mensagem personalizada (opcional)
            </label>
            <textarea
              id="welcomeMessage"
              rows={3}
              value={form.welcomeMessage}
              onChange={(e) => update("welcomeMessage", e.target.value)}
              placeholder="Ex: Duas vidas, dois corações, uma história para toda a vida..."
              className={inputClass}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#C5A059] px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[#b08f4a] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "A guardar convite..." : "Guardar e avançar para convidados & fotos →"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
