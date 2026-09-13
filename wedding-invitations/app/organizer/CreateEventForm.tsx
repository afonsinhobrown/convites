"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateEventForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    ceremonyTime: "",
    ceremonyVenue: "",
    ceremonyAddress: "",
    rsvpContact: "",
    welcomeMessage: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/organizer/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar evento");
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[#C5A059]/20 bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="brideName" className="block text-sm font-medium text-gray-700">
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
          <label htmlFor="groomName" className="block text-sm font-medium text-gray-700">
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ceremonyVenue" className="block text-sm font-medium text-gray-700">
            Local da cerimónia
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
          <label htmlFor="ceremonyAddress" className="block text-sm font-medium text-gray-700">
            Endereço
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
        <label htmlFor="rsvpContact" className="block text-sm font-medium text-gray-700">
          Contacto para RSVP
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
        <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
          Mensagem de boas-vindas (opcional)
        </label>
        <textarea
          id="welcomeMessage"
          rows={3}
          value={form.welcomeMessage}
          onChange={(e) => update("welcomeMessage", e.target.value)}
          placeholder="Ex: A vossa presença será a nossa alegria..."
          className={inputClass}
        />
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[#C5A059] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#b08f4a] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "A criar..." : "Criar evento"}
      </button>
    </form>
  );
}