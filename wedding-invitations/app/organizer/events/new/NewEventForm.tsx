"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplatePreview } from "@/components/invitations/TemplatePreview";
import { Check, Sparkles, SlidersHorizontal } from "lucide-react";
import { getTemplateActiveFields } from "@/lib/designer-layout";

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
    invitationHeader?: string;
    invitationIntro?: string;
    invitationRomantic?: string;
    invitationHonor?: string;
    invitationFooter?: string;
    invitationValues?: string;
  };
}

export function NewEventForm({
  initialTemplateSlug,
  templates,
  defaultValues,
}: NewEventFormProps) {
  const router = useRouter();
  const [templateSlug, setTemplateSlug] = useState(initialTemplateSlug);
  const [form, setForm] = useState({
    ...defaultValues,
    invitationHeader: defaultValues.invitationHeader ?? "Com a Bênção de Deus",
    invitationIntro: defaultValues.invitationIntro ?? "Temos a alegria de vos convidar para o nosso casamento",
    invitationRomantic: defaultValues.invitationRomantic ?? "Duas vidas, dois corações, uma história para toda a vida.",
    invitationHonor: defaultValues.invitationHonor ?? "Será uma honra celebrar este momento tão especial na presença de vocês.",
    invitationFooter: defaultValues.invitationFooter ?? "Juntos para sempre",
    invitationValues: defaultValues.invitationValues ?? "Amor · Respeito · Companheirismo · Sempre",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedTemplate =
    templates.find((t) => t.slug === templateSlug) ?? templates[0];

  const active = getTemplateActiveFields(selectedTemplate?.layoutJson, selectedTemplate?.slug);

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
            {selectedTemplate.name}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {templates.map((tpl) => {
            const isSelected = tpl.slug === templateSlug;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplateSlug(tpl.slug)}
                className={`group relative flex flex-col overflow-hidden rounded-xl border-2 p-2 text-left transition-all ${
                  isSelected
                    ? "border-[#C5A059] bg-[#C5A059]/5 shadow-md"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="relative mb-2 aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
                  <TemplatePreview
                    slug={tpl.slug}
                    name={tpl.name}
                    componentName={tpl.componentName}
                    previewUrl={tpl.previewUrl}
                    layoutJson={tpl.layoutJson}
                    demoData={tpl.demoData}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute right-2 top-2 rounded-full bg-[#C5A059] p-1 text-white shadow-sm">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {tpl.name}
                </p>
                <p className="text-[11px] text-gray-500">
                  {(tpl.priceUsdCents / 100).toFixed(2)} USD
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* FORMULÁRIO DINÂMICO BASEADO NO MODELO */}
      <div className="rounded-2xl border border-[#C5A059]/20 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              2. Personalizar dados do casamento
            </h2>
            <p className="text-sm text-gray-500">
              O formulário abaixo foi ajustado automaticamente aos componentes do modelo{" "}
              <strong className="text-gray-700">{selectedTemplate.name}</strong>.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 font-medium">
            <SlidersHorizontal className="h-3 w-3 text-[#C5A059]" />
            Campos do modelo ativos
          </span>
        </div>

        <div className="space-y-4">
          {/* Nomes dos Noivos */}
          {(active.hasBrideName || active.hasGroomName || active.hasCouple) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(active.hasBrideName || (!active.hasBrideName && !active.hasGroomName && active.hasCouple)) && (
                <div>
                  <label htmlFor="brideName" className="block text-sm font-medium text-gray-700">
                    {active.hasCouple && !active.hasBrideName && !active.hasGroomName
                      ? "Nome da Noiva (ou 1º Noivo)"
                      : "Nome da noiva"}
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
              )}
              {(active.hasGroomName || (!active.hasBrideName && !active.hasGroomName && active.hasCouple)) && (
                <div>
                  <label htmlFor="groomName" className="block text-sm font-medium text-gray-700">
                    {active.hasCouple && !active.hasBrideName && !active.hasGroomName
                      ? "Nome do Noivo (ou 2º Noivo)"
                      : "Nome do noivo"}
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
              )}
            </div>
          )}

          {/* Data e Hora */}
          {(active.hasDate || active.hasTime) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {active.hasDate && (
                <div>
                  <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700">
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
              )}
              {active.hasTime && (
                <div>
                  <label htmlFor="ceremonyTime" className="block text-sm font-medium text-gray-700">
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
              )}
            </div>
          )}

          {/* Local e Morada */}
          {(active.hasVenue || active.hasAddress) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {active.hasVenue && (
                <div>
                  <label htmlFor="ceremonyVenue" className="block text-sm font-medium text-gray-700">
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
              )}
              {active.hasAddress && (
                <div>
                  <label htmlFor="ceremonyAddress" className="block text-sm font-medium text-gray-700">
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
              )}
            </div>
          )}

          {/* Contacto RSVP */}
          {active.hasRsvp && (
            <div>
              <label htmlFor="rsvpContact" className="block text-sm font-medium text-gray-700">
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
          )}

          {/* Mensagem / Frase Romântica */}
          {active.hasRomantic && (
            <div>
              <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
                Mensagem personalizada / Frase romântica
              </label>
              <textarea
                id="welcomeMessage"
                rows={3}
                value={form.welcomeMessage}
                onChange={(e) => {
                  update("welcomeMessage", e.target.value);
                  update("invitationRomantic", e.target.value);
                }}
                placeholder="Ex: Duas vidas, dois corações, uma história para toda a vida..."
                className={inputClass}
              />
            </div>
          )}

          {/* Textos adicionais se presentes no modelo */}
          {(active.hasHeader || active.hasIntro || active.hasHonor || active.hasFooter || active.hasValues) && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8B5A2B]">
                Textos Especiais do Modelo
              </h3>
              {active.hasHeader && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Cabeçalho</label>
                  <input
                    type="text"
                    value={form.invitationHeader}
                    onChange={(e) => update("invitationHeader", e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
              {active.hasIntro && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Introdução do Convite</label>
                  <input
                    type="text"
                    value={form.invitationIntro}
                    onChange={(e) => update("invitationIntro", e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
              {active.hasHonor && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Frase de Homenagem</label>
                  <input
                    type="text"
                    value={form.invitationHonor}
                    onChange={(e) => update("invitationHonor", e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
              {active.hasFooter && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Rodapé</label>
                  <input
                    type="text"
                    value={form.invitationFooter}
                    onChange={(e) => update("invitationFooter", e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
              {active.hasValues && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Valores / Lema</label>
                  <input
                    type="text"
                    value={form.invitationValues}
                    onChange={(e) => update("invitationValues", e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#C5A059] px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-[#B38F48] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "A gravar e preparar convite..."
                : "Avançar para Pagamento do Modelo →"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
