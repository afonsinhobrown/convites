"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Link2, Sparkles, FileDown, Download, Printer, Users } from "lucide-react";
import { InvitationRenderer } from "@/components/invitations/InvitationRenderer";
import type { InvitationData } from "@/components/invitations/types";

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

interface TemplateInfo {
  layout: string;
  layoutJson?: unknown;
  previewUrl?: string | null;
}

export function InvitesPanel({
  eventId,
  initialGuests,
  eventData,
  template,
}: {
  eventId: string;
  initialGuests: InviteGuest[];
  eventData: InvitationData;
  template: TemplateInfo;
}) {
  const router = useRouter();
  const [guests, setGuests] = useState<InviteGuest[]>(initialGuests);
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState<"for_print" | "for_guest" | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function generateLinks() {
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
      setMessage(`${data.length} ligação${data.length === 1 ? "" : "ões"} de convite gerada${data.length === 1 ? "" : "s"}.`);
      router.refresh();
    } catch {
      setMessage("Erro de ligação ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadFiles(session: "for_print" | "for_guest") {
    setGenerating(session);
    setModalError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/invitations/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: session }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data?.error === "string" ? data.error : "Erro ao gerar");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : session === "for_print" ? "convite.png" : "convites.zip";

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);

      setSuccess(
        session === "for_print"
          ? "Convite em branco para imprimir gerado (1 PNG)."
          : `Convites individuais gerados (${guests.length} PNG em ZIP).`
      );
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Erro ao gerar convites");
    } finally {
      setGenerating(null);
    }
  }

  const statusLabel: Record<string, string> = {
    PENDING: "Sem resposta",
    CONFIRMED: "Confirmado",
    DECLINED: "Não vai",
  };

  // Preview da Opção B com um nome de exemplo
  const sampleGuest = guests[0]?.name ?? "Convidado Exemplo";
  const forGuestData = { ...eventData, guestName: sampleGuest };

  return (
    <div className="space-y-4 rounded-2xl border border-[#C5A059]/20 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">Convidados ({guests.length})</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={generateLinks}
            disabled={loading || guests.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Link2 className="h-4 w-4" />
            {loading ? "A gerar..." : "Gerar links"}
          </button>
          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
              setModalError(null);
              setSuccess(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            Gerar convites
          </button>
        </div>
      </div>

      {message && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    g.rsvpStatus === "CONFIRMED" ? "bg-emerald-100 text-emerald-800"
                      : g.rsvpStatus === "DECLINED" ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {statusLabel[g.rsvpStatus] ?? g.rsvpStatus}
                    {g.rsvpStatus === "CONFIRMED" ? ` · ${g.guestsCount} pessoa(s)` : ""}
                  </span>
                </div>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-[#C5A059] hover:underline">
                    <Link2 className="h-3.5 w-3.5" />
                    Abrir convite
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Gerar convites</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Escolha como pretende gerar os convites do {eventData.brideName} &amp; {eventData.groomName}.
            </p>

            {success && (
              <div role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {success}
              </div>
            )}
            {modalError && (
              <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {modalError}
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Opção A */}
              <div className="flex flex-col rounded-2xl border border-[#C5A059]/30 bg-[#FDFBF7] p-4">
                <div className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-[#8B5A2B]" />
                  <h4 className="font-semibold text-gray-900">Opção A — Para imprimir</h4>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Todos os dados preenchidos. Espaço do convidado em branco para escrever à mão.
                </p>

                <div className="mt-3 flex justify-center">
                  <div className="w-36">
                    <InvitationRenderer
                      layout={template.layout}
                      data={eventData}
                      layoutJson={template.layoutJson as never}
                      previewUrl={template.previewUrl}
                      mode="for_print"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadFiles("for_print")}
                  disabled={generating !== null}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C5A059] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#b08f4a] disabled:cursor-wait disabled:opacity-60"
                >
                  {generating === "for_print" ? <FileDown className="h-4 w-4 animate-pulse" /> : <Download className="h-4 w-4" />}
                  {generating === "for_print" ? "A gerar..." : "Gerar 1 convite (PNG)"}
                </button>
              </div>

              {/* Opção B */}
              <div className="flex flex-col rounded-2xl border border-[#C5A059]/30 bg-[#FDFBF7] p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#8B5A2B]" />
                  <h4 className="font-semibold text-gray-900">Opção B — Individuais</h4>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Um convite por convidado, com o nome de cada um. Entrega em ZIP.
                </p>

                <div className="mt-3 flex justify-center">
                  <div className="w-36">
                    <InvitationRenderer
                      layout={template.layout}
                      data={forGuestData}
                      layoutJson={template.layoutJson as never}
                      previewUrl={template.previewUrl}
                      mode="for_guest"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadFiles("for_guest")}
                  disabled={generating !== null || guests.length === 0}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C5A059] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#b08f4a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating === "for_guest" ? <FileDown className="h-4 w-4 animate-pulse" /> : <Download className="h-4 w-4" />}
                  {generating === "for_guest"
                    ? "A gerar..."
                    : `Gerar ${guests.length} convites (ZIP)`}
                </button>
                {guests.length === 0 && (
                  <p className="mt-2 text-center text-xs text-gray-400">Adicione convidados primeiro.</p>
                )}
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              A geração é feita no servidor; o download começa automaticamente quando estiver pronto.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}