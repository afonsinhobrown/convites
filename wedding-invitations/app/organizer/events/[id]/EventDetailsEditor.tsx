"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Check, X } from "lucide-react";

interface EventDataProps {
  eventId: string;
  initialData: {
    brideName: string;
    groomName: string;
    weddingDateRaw: string;
    ceremonyTime: string;
    ceremonyVenue: string;
    ceremonyAddress: string;
    rsvpContact: string;
    welcomeMessage: string;
  };
}

export function EventDetailsEditor({ eventId, initialData }: EventDataProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <h3 className="text-lg font-bold text-gray-900">Editar dados do casamento</h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da noiva</label>
              <input
                type="text"
                required
                value={form.brideName}
                onChange={(e) => update("brideName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome do noivo</label>
              <input
                type="text"
                required
                value={form.groomName}
                onChange={(e) => update("groomName", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Endereço</label>
              <input
                type="text"
                value={form.ceremonyAddress}
                onChange={(e) => update("ceremonyAddress", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700">Mensagem personalizada</label>
            <textarea
              rows={3}
              value={form.welcomeMessage}
              onChange={(e) => update("welcomeMessage", e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-2">
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C5A059] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#b08f4a] disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {loading ? "A guardar..." : "Guardar dados"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
