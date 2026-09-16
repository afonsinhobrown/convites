"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Link2,
  Sparkles,
  FileDown,
  Download,
  Printer,
  Users,
  Trash2,
  CreditCard,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  MessageCircle,
} from "lucide-react";
import { InvitationRenderer } from "@/components/invitations/InvitationRenderer";
import type { InvitationData } from "@/components/invitations/types";
import { WhatsAppModal } from "./WhatsAppModal";

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
  guestFeePaid = false,
  guestFeeCents = 2500,
  sandboxAllowed = true,
}: {
  eventId: string;
  initialGuests: InviteGuest[];
  eventData: InvitationData;
  template: TemplateInfo;
  guestFeePaid?: boolean;
  guestFeeCents?: number;
  sandboxAllowed?: boolean;
}) {
  const router = useRouter();
  const [guests, setGuests] = useState<InviteGuest[]>(initialGuests);
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Estados da taxa de convidados
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [isSandboxFee, setIsSandboxFee] = useState(false);
  const [feeMethod, setFeeMethod] = useState<"mpesa" | "card">("mpesa");
  const [feePhone, setFeePhone] = useState("");
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [feeSuccess, setFeeSuccess] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [generating, setGenerating] = useState<"for_print" | "for_guest" | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const feePerGuest = Math.round(guestFeeCents / 100);
  const totalFeeMzn = guests.length * feePerGuest;

  // Polling para pagamento da taxa de convidados
  useEffect(() => {
    if (guestFeePaid) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/organizer/events/${eventId}/payment/guest-fee`);
        const data = await res.json();
        if (data.paid) {
          router.refresh();
        }
      } catch {
        // silencioso
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [eventId, guestFeePaid, router]);

  async function handlePayGuestFee(e: React.FormEvent) {
    e.preventDefault();
    setFeeError(null);
    setFeeSuccess(null);

    let cleanMsisdn = "";

    if (feeMethod === "mpesa") {
      let localDigits = feePhone.replace(/\D/g, "");
      if (localDigits.startsWith("258") && localDigits.length > 9) {
        localDigits = localDigits.slice(3);
      }
      if (!localDigits.startsWith("84") && !localDigits.startsWith("85")) {
        setFeeError(
          "Para pagar via M-Pesa é necessário um número Vodacom (iniciado por 84 ou 85). Se utiliza outro operador/banco, selecione 'BIM / Cartão'."
        );
        return;
      }
      if (localDigits.length !== 9) {
        setFeeError("O número de telefone deve ter exatamente 9 dígitos (ex: 84 123 4567).");
        return;
      }
      cleanMsisdn = `258${localDigits}`;
    }

    setFeeLoading(true);

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/payment/guest-fee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: feeMethod, phone: cleanMsisdn || feePhone, isSandbox: isSandboxFee }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar pagamento na NetShop");
      }

      if (data.paid) {
        setFeeModalOpen(false);
        router.refresh();
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setFeeSuccess("Pedido enviado para o seu telefone. Confirme com o PIN no M-Pesa.");
      }
    } catch (err) {
      setFeeError(err instanceof Error ? err.message : "Erro ao processar pagamento");
    } finally {
      setFeeLoading(false);
    }
  }

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
      {/* Banner da Taxa de Convidados */}
      {!guestFeePaid ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Taxa de Convidados Pendente
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Taxa obrigatória: <strong>{feePerGuest} MT</strong> por convidado (Total: <strong>{totalFeeMzn} MT</strong> para {guests.length} convidados).
                </p>
              </div>
            </div>
            {guests.length > 0 && (
              <button
                type="button"
                onClick={() => setFeeModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C5A059] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#b08f4a] transition whitespace-nowrap"
              >
                Pagar Taxa ({totalFeeMzn} MT) →
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Taxa de convidados liquidada ({feePerGuest} MT / convidado)</span>
          </div>
          <span className="text-xs font-semibold text-emerald-700">{guests.length} convidados activos</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">Convidados ({guests.length})</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={guestFeePaid ? generateLinks : () => setFeeModalOpen(true)}
            disabled={loading || guests.length === 0}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              guestFeePaid
                ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                : "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            } disabled:cursor-not-allowed disabled:opacity-60`}
            title={guestFeePaid ? "Gerar links" : "Pague a taxa de convidados para gerar links"}
          >
            {guestFeePaid ? <Link2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {loading ? "A gerar..." : "Gerar links"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!guestFeePaid) {
                setFeeModalOpen(true);
                return;
              }
              setWhatsAppModalOpen(true);
            }}
            disabled={guests.length === 0}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              guestFeePaid
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                : "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            } disabled:cursor-not-allowed disabled:opacity-60`}
            title={guestFeePaid ? "Enviar convites via WhatsApp" : "Pague a taxa para enviar convites"}
          >
            {guestFeePaid ? <MessageCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            Enviar WhatsApp
          </button>
          <button
            type="button"
            onClick={() => {
              if (!guestFeePaid) {
                setFeeModalOpen(true);
                return;
              }
              setModalOpen(true);
              setModalError(null);
              setSuccess(null);
            }}
            disabled={guests.length === 0}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
              guestFeePaid ? "bg-[#C5A059] hover:bg-[#b08f4a]" : "bg-[#C5A059] hover:bg-[#b08f4a]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {guestFeePaid ? <Sparkles className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {guestFeePaid ? "Gerar convites" : "Pagar taxa para gerar"}
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
                <div className="flex items-center gap-3">
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
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(`Remover o convidado "${g.name}"?`)) return;
                      try {
                        const res = await fetch(`/api/organizer/events/${eventId}/guests/${g.id}`, {
                          method: "DELETE",
                        });
                        if (res.ok) {
                          setGuests((prev) => prev.filter((item) => item.id !== g.id));
                          router.refresh();
                        }
                      } catch {
                        // silencioso
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition"
                    title="Remover convidado"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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

      {/* Modal de Pagamento da Taxa de Convidados via NetShop */}
      {feeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Taxa de Emissão de Convites</h3>
                <p className="text-xs text-gray-500">Pagamento oficial via NetShop</p>
              </div>
              <button
                type="button"
                onClick={() => setFeeModalOpen(false)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-[#FDFBF7] p-4 border border-[#C5A059]/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total de convidados:</span>
                <span className="font-semibold text-gray-900">{guests.length}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Preço por convite:</span>
                <span className="font-semibold text-gray-900">{feePerGuest} MT</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 mt-3 pt-2">
                <span>Total a pagar:</span>
                <span className="text-[#C5A059]">
                  {isSandboxFee ? "10 MT (doremi modo sandbox)" : `${totalFeeMzn} MT`}
                </span>
              </div>
            </div>

            <form onSubmit={handlePayGuestFee} className="mt-5 space-y-4">
              {/* Seleção do Método */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFeeMethod("mpesa")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    feeMethod === "mpesa"
                      ? "border-red-600 bg-red-50 text-red-700 font-semibold"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Smartphone className="h-4 w-4 mb-1 text-red-600" />
                  <span className="text-xs">M-Pesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeeMethod("card")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    feeMethod === "card"
                      ? "border-[#8B5A2B] bg-[#8B5A2B]/10 text-[#8B5A2B] font-semibold"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1 text-[#8B5A2B]" />
                  <span className="text-xs">BIM / Cartão</span>
                </button>
              </div>

              {feeMethod === "mpesa" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Número M-Pesa (Vodacom)
                  </label>
                  <div className="mt-1 flex rounded-lg shadow-sm">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-3 text-xs font-bold text-gray-700 select-none">
                      +258
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={9}
                      value={feePhone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.startsWith("258") && val.length > 9) {
                          val = val.slice(3);
                        }
                        setFeePhone(val.slice(0, 9));
                      }}
                      placeholder="841234567"
                      className="block w-full rounded-r-lg border border-gray-300 px-3 py-2 text-sm font-medium tracking-wider focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Introduza apenas os 9 dígitos. O prefixo +258 é adicionado automaticamente.
                  </p>
                </div>
              )}

              {/* Checkbox Sandbox */}
              {sandboxAllowed && (
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50/70 p-3">
                  <input
                    id="guestfee-sandbox-toggle"
                    type="checkbox"
                    checked={isSandboxFee}
                    onChange={(e) => setIsSandboxFee(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label
                    htmlFor="guestfee-sandbox-toggle"
                    className="text-xs font-semibold text-amber-900 cursor-pointer select-none"
                  >
                    Activar modo sandbox (10 MT — doremi modo sandbox)
                  </label>
                </div>
              )}

              {feeError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  {feeError}
                </div>
              )}

              {feeSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                  {feeSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={feeLoading || guests.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-[#b08f4a] transition disabled:opacity-50"
              >
                {feeLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    Pagar{" "}
                    {isSandboxFee ? "10 MT (doremi modo sandbox)" : `${totalFeeMzn} MT`}{" "}
                    agora →
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Envio via WhatsApp */}
      <WhatsAppModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        eventId={eventId}
        guests={guests}
        eventData={{
          brideName: eventData.brideName,
          groomName: eventData.groomName,
          weddingDateFormatted: `${eventData.day} de ${eventData.month} de ${eventData.year}`,
          ceremonyVenue: eventData.venue,
          ceremonyTime: eventData.time,
        }}
      />
    </div>
  );
}