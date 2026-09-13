"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

export function GuestForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", maxCompanions: "0" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          maxCompanions: Number(form.maxCompanions),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao adicionar convidado");
        return;
      }
      setForm({ name: "", phone: "", email: "", maxCompanions: "0" });
      setSuccess(`${data.name} adicionado. Os convites podem ser gerados abaixo.`);
      router.refresh();
    } catch {
      setError("Erro de ligação ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-[#C5A059]/20 bg-white p-5 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            id="guestName"
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex: Maria Nhantumbo"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700">
            Telefone
          </label>
          <input
            id="guestPhone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="Ex: +258 84 123 4567"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="guestEmail"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Ex: maria@email.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="guestCompanions" className="block text-sm font-medium text-gray-700">
            Acompanhantes (nº)
          </label>
          <input
            id="guestCompanions"
            type="number"
            min={0}
            max={9}
            value={form.maxCompanions}
            onChange={(e) => update("maxCompanions", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#C5A059] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#b08f4a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus className="h-4 w-4" />
        {loading ? "A adicionar..." : "Adicionar convidado"}
      </button>
    </form>
  );
}