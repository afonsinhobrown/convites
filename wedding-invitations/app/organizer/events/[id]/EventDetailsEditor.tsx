"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, X } from "lucide-react";
import { getTemplateActiveFields } from "@/lib/designer-layout";

interface EventDataProps {
  eventId: string;
  templateLayoutJson?: unknown;
  templateSlug?: string;
  initialData: {
    brideName: string;
    groomName: string;
    weddingDateRaw: string;
    ceremonyTime: string;
    ceremonyVenue: string;
    ceremonyAddress: string;
    rsvpContact: string;
    welcomeMessage: string;
    invitationHeader: string;
    invitationIntro: string;
    invitationRomantic: string;
    invitationHonor: string;
    invitationFooter: string;
    invitationValues: string;
  };
}

export function EventDetailsEditor({
  eventId,
  templateLayoutJson,
  templateSlug,
  initialData,
}: EventDataProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = getTemplateActiveFields(templateLayoutJson, templateSlug);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/organizer/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brideName: form.brideName,
          groomName: form.groomName,
          weddingDate: form.weddingDateRaw,
          ceremonyTime: form.ceremonyTime,
          ceremonyVenue: form.ceremonyVenue,
          ceremonyAddress: form.ceremonyAddress,
          rsvpContact: form.rsvpContact,
          welcomeMessage: form.welcomeMessage,
          invitationHeader: form.invitationHeader,
          invitationIntro: form.invitationIntro,
          invitationRomantic: form.invitationRomantic,
          invitationHonor: form.invitationHonor,
          invitationFooter: form.invitationFooter,
          invitationValues: form.invitationValues,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao salvar alterações");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar alterações");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]";

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#C5A059] bg-white px-3.5 py-1.5 text-sm font-medium text-[#C5A059] shadow-sm transition hover:bg-[#C5A059]/5"
      >
        <Edit2 className="h-4 w-4" />
        Editar dados do casamento
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Editar dados do casamento</h3>
            <p className="text-xs text-gray-500">
              Mostrando os campos utilizados pelo modelo do seu convite.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Nomes dos Noivos */}
          {(active.hasBrideName || active.hasGroomName || active.hasCouple) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(active.hasBrideName || (!active.hasBrideName && !active.hasGroomName && active.hasCouple)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {active.hasCouple && !active.hasBrideName && !active.hasGroomName
                      ? "Nome da Noiva (ou 1º Noivo)"
                      : "Nome da noiva"}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.brideName}
                    onChange={(e) => update("brideName", e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
              {(active.hasGroomName || (!active.hasBrideName && !active.hasGroomName && active.hasCouple)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {active.hasCouple && !active.hasBrideName && !active.hasGroomName
                      ? "Nome do Noivo (ou 2º Noivo)"
                      : "Nome do noivo"}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.groomName}
                    onChange={(e) => update("groomName", e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700">Data do casamento</label>
                  <input
                    type="date"
                    required
                    value={form.weddingDateRaw}
                    onChange={(e) => update("weddingDateRaw", e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
              {active.hasTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hora da cerimónia</label>
                  <input
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
                  <label className="block text-sm font-medium text-gray-700">Local da cerimónia</label>
                  <input
                    type="text"
                    required
                    value={form.ceremonyVenue}
                    onChange={(e) => update("ceremonyVenue", e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
              {active.hasAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço / Morada</label>
                  <input
                    type="text"
                    value={form.ceremonyAddress}
                    onChange={(e) => update("ceremonyAddress", e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          )}

          {/* Contacto RSVP */}
          {active.hasRsvp && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Contacto RSVP</label>
              <input
                type="text"
                required
                value={form.rsvpContact}
                onChange={(e) => update("rsvpContact", e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {/* Mensagem / Frase Romântica */}
          {active.hasRomantic && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Mensagem personalizada / Frase</label>
              <textarea
                rows={2}
                value={form.welcomeMessage}
                onChange={(e) => {
                  update("welcomeMessage", e.target.value);
                  update("invitationRomantic", e.target.value);
                }}
                className={inputClass}
              />
            </div>
          )}

          {/* Textos adicionais específicos do modelo */}
          {(active.hasHeader || active.hasIntro || active.hasHonor || active.hasFooter || active.hasValues) && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <h4 className="text-xs font-semibold text-[#8B5A2B] uppercase tracking-wider">
                Textos do Convite
              </h4>

              {active.hasHeader && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Cabeçalho</label>
                  <input
                    type="text"
                    value={form.invitationHeader}
                    onChange={(e) => update("invitationHeader", e.target.value)}
                    placeholder="Com a Bênção de Deus"
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
                    placeholder="Temos a alegria de vos convidar para o nosso casamento"
                    className={inputClass}
                  />
                </div>
              )}

              {active.hasHonor && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Homenagem / Presença</label>
                  <input
                    type="text"
                    value={form.invitationHonor}
                    onChange={(e) => update("invitationHonor", e.target.value)}
                    placeholder="Será uma honra celebrar este momento tão especial na presença de vocês."
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
                    placeholder="Juntos para sempre"
                    className={inputClass}
                  />
                </div>
              )}

              {active.hasValues && (
                <div>
                  <label className="block text-xs font-medium text-gray-700">Valores / Mensagem de Fundo</label>
                  <input
                    type="text"
                    value={form.invitationValues}
                    onChange={(e) => update("invitationValues", e.target.value)}
                    placeholder="Amor · Respeito · Companheirismo · Sempre"
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#C5A059] px-5 py-2 text-sm font-medium text-white shadow hover:bg-[#B38F48] disabled:opacity-50"
            >
              {loading ? "A guardar..." : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
