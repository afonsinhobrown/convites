"use client";

import { useState } from "react";
import { X, Send, Users, Smartphone, Check, Loader2, MessageSquare, Copy } from "lucide-react";
import type { InviteGuest } from "./InvitesPanel";

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  guests: InviteGuest[];
  eventData: {
    brideName: string;
    groomName: string;
    weddingDateFormatted: string;
    ceremonyVenue: string;
    ceremonyTime: string;
  };
}

export function WhatsAppModal({
  isOpen,
  onClose,
  eventId,
  guests,
  eventData,
}: WhatsAppModalProps) {
  const [tab, setTab] = useState<"individual" | "bulk">("individual");
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Estados da Opção B (Lote)
  const [bulkPhone, setBulkPhone] = useState("");
  const [bulkRecipientName, setBulkRecipientName] = useState("Noivos / Cerimonial");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  function buildGuestMessage(g: InviteGuest) {
    const url = g.inviteUrl || "https://convites-beta.vercel.app";
    return `Olá *${g.name}*!\n\nÉ com enorme alegria que nós, *${eventData.brideName} & ${eventData.groomName}*, vos convidamos para celebrar o nosso casamento no dia *${eventData.weddingDateFormatted}* às *${eventData.ceremonyTime}* em *${eventData.ceremonyVenue}*.\n\nAceda ao seu convite exclusivo e confirme a sua presença através do link abaixo:\n${url}\n\nContamos com a sua presença neste dia tão especial! 💍✨`;
  }

  function buildBulkMessage() {
    const lines = guests.map((g, idx) => {
      const url = g.inviteUrl || "https://convites-beta.vercel.app";
      return `${idx + 1}. *${g.name}*: ${url}`;
    });

    return `💍 *CONVITES DE CASAMENTO — ${eventData.brideName.toUpperCase()} & ${eventData.groomName.toUpperCase()}*\n📅 Data: ${eventData.weddingDateFormatted} às ${eventData.ceremonyTime}\n📍 Local: ${eventData.ceremonyVenue}\n\n📋 *LISTA DE CONVITES INDIVIDUAIS (${guests.length}):*\n\n${lines.join("\n\n")}`;
  }

  async function handleSendIndividual(guest: InviteGuest, phoneOverride?: string) {
    const targetPhone = (phoneOverride || guest.phone || "").replace(/\D/g, "");
    if (!targetPhone) {
      alert("Por favor introduza o número de telefone do convidado.");
      return;
    }

    const cleanPhone = targetPhone.startsWith("258") ? targetPhone : `258${targetPhone}`;
    const message = buildGuestMessage(guest);

    setSendingId(guest.id);

    try {
      // Registar envio na BD
      await fetch(`/api/organizer/events/${eventId}/whatsapp/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guest.id,
          recipientName: guest.name,
          recipientPhone: cleanPhone,
          mode: "INDIVIDUAL",
          messageText: message,
        }),
      });

      setSentMap((prev) => ({ ...prev, [guest.id]: true }));

      // Abrir WhatsApp Web / App
      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error("Erro ao enviar convite via WhatsApp:", err);
    } finally {
      setSendingId(null);
    }
  }

  async function handleSendBulk(e: React.FormEvent) {
    e.preventDefault();
    const clean = bulkPhone.replace(/\D/g, "");
    if (!clean) {
      alert("Introduza o número de telefone de destino.");
      return;
    }

    const cleanPhone = clean.startsWith("258") ? clean : `258${clean}`;
    const message = buildBulkMessage();

    setBulkSending(true);

    try {
      await fetch(`/api/organizer/events/${eventId}/whatsapp/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: bulkRecipientName,
          recipientPhone: cleanPhone,
          mode: "BULK",
          messageText: message,
        }),
      });

      setBulkSuccess(true);

      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error("Erro ao enviar lote WhatsApp:", err);
    } finally {
      setBulkSending(false);
    }
  }

  function handleCopyBulk() {
    const text = buildBulkMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="text-lg font-bold">Envio de Convites via WhatsApp</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-emerald-100 hover:bg-emerald-800"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs de Selecção */}
        <div className="flex border-b bg-gray-50 px-6 pt-3">
          <button
            type="button"
            onClick={() => setTab("individual")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === "individual"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users className="h-4 w-4" />
            Opção A: Envio Individual (1 a 1)
          </button>

          <button
            type="button"
            onClick={() => setTab("bulk")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === "bulk"
                ? "border-emerald-600 text-emerald-700 bg-white rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Opção B: Todos os Convites para 1 Número
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "individual" ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Dispare o convite personalizado directamente para o WhatsApp de cada convidado.
              </p>

              {guests.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  Nenhum convidado registado no evento.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                  {guests.map((g) => {
                    const isSent = !!sentMap[g.id];
                    const isSending = sendingId === g.id;

                    return (
                      <li
                        key={g.id}
                        className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">{g.name}</p>
                          <p className="text-xs text-gray-500">
                            {g.phone ? `+258 ${g.phone}` : "Sem telefone"} · {g.guestsCount} pessoa(s)
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSent && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <Check className="h-3.5 w-3.5" />
                              Enviado
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSendIndividual(g)}
                            disabled={isSending}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
                          >
                            {isSending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            {isSent ? "Reenviar WhatsApp" : "Enviar no WhatsApp"}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <form onSubmit={handleSendBulk} className="space-y-5">
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-900">
                Esta opção compila a lista completa com os links individuais dos <strong>{guests.length} convidados</strong> e envia num único bloco para o número que indicar (ideal para cerimonialistas ou distribuição manual).
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Nome do Destinatário
                </label>
                <input
                  type="text"
                  required
                  value={bulkRecipientName}
                  onChange={(e) => setBulkRecipientName(e.target.value)}
                  placeholder="Ex: Noiva / Cerimonialista Ana"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Número de WhatsApp de Destino
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-xs text-gray-500">
                    +258
                  </span>
                  <input
                    type="tel"
                    required
                    value={bulkPhone.replace(/^\+?258/, "")}
                    onChange={(e) => setBulkPhone(`+258${e.target.value.replace(/\D/g, "")}`)}
                    placeholder="841234567"
                    className="block w-full rounded-r-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Pré-visualização da Mensagem de Lote
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyBulk}
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? "Copiado!" : "Copiar texto"}
                  </button>
                </div>
                <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700 border border-gray-200 font-mono">
                  {buildBulkMessage()}
                </pre>
              </div>

              {bulkSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  Lista de convites enviada com sucesso para o WhatsApp!
                </div>
              )}

              <button
                type="submit"
                disabled={bulkSending || guests.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {bulkSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    A abrir WhatsApp...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar todos os convites ({guests.length}) no WhatsApp →
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
