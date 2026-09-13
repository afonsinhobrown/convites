"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Sparkles } from "lucide-react";

export interface InviteGuest {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  rsvpStatus: string;
  guestsCount: number;
  maxCompanions: number;
  secureToken: string | null;
  inviteUrl: string | null;
}

export function InvitesPanel({
  eventId,
  initialGuests,
}: {
  eventId: string;
  initialGuests: InviteGuest[];
}) {
  const router = useRouter();
  const [guests, setGuests] = useState<InviteGuest[]>(initialGuests);
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/generate`, { method: "POST" });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        setMessage(typeof data?.error === "string" ? data.error : "Erro ao gerar convites");
        return;
      }
      const urls: Record<string, string> = {};
      for (const item of data) {
        urls[item.id] = item.inviteUrl;
      }
      setGeneratedUrls(urls);
      setGuests((prev) =>
        prev.map((g) => ({
          ...g,
          inviteUrl: urls[g.id] ?? g.inviteUrl,
        }))
      );
      setMessage(`${data.length} convite${data.length === 1 ? "" : "s"} gerado${data.length === 1 ? "" : "s"} com sucesso.`);
      router.refresh();
    } catch {
      setMessage("Erro de ligação ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  const statusLabel: Record<string, string> = {
    PENDING: "Sem resposta",
    CONFIRMED: "Confirmado",
    DECLINED: "Não vai",
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#C5A059]/20 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">Convidados ({guests.length})</h3>
        <button
          type="button"
          onClick={generate}
          disabled={loading || guests.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "A gerar..." : "Gerar Convites"}
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {message}
        </div>
      )}

      {guests.length === 0 ? (
        <p className="text-sm text-gray-500">Adicione convidados para gerar os convites.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {guests.map((g) => {
            const url = generatedUrls[g.id] ?? g.inviteUrl;
            return (
              <li key={g.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{g.name}</p>
                  <p className="text-xs text-gray-500">
                    {[g.phone, g.email].filter(Boolean).join(" · ") || "sem contacto"}
                    {g.maxCompanions > 0 ? ` · ${g.maxCompanions} acompanhante(s)` : ""}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      g.rsvpStatus === "CONFIRMED"
                        ? "bg-emerald-100 text-emerald-800"
                        : g.rsvpStatus === "DECLINED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabel[g.rsvpStatus] ?? g.rsvpStatus}
                    {g.rsvpStatus === "CONFIRMED" ? ` · ${g.guestsCount} pessoa(s)` : ""}
                  </span>
                </div>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#C5A059] hover:underline"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Abrir convite
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}