"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RsvpForm({
  secureToken,
  initialGuestsCount,
}: {
  secureToken: string;
  initialGuestsCount?: number;
}) {
  const router = useRouter();
  const [guestsCount, setGuestsCount] = useState(initialGuestsCount ?? 1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function respond(status: "CONFIRMED" | "DECLINED") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invite/${secureToken}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpStatus: status, guestsCount }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Erro ao registar resposta");
        return;
      }
      router.refresh();
    } catch {
      setError("Erro de ligação ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-[#C5A059]/20 bg-white p-6 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Confirme a sua presença</h2>

      <div>
        <label htmlFor="count" className="block text-sm text-gray-600">
          Quantas pessoas?
        </label>
        <select
          id="count"
          value={guestsCount}
          onChange={(e) => setGuestsCount(Number(e.target.value))}
          className="mt-1 w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => respond("CONFIRMED")}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "A registar..." : "Vou!"}
        </button>
        <button
          type="button"
          onClick={() => respond("DECLINED")}
          disabled={loading}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          {loading ? "A registar..." : "Não vou poder"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}