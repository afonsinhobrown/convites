"use client";

import { useState } from "react";
import { MapPin, Gift, MessageSquare, Send, Check, Copy } from "lucide-react";

interface InvitationActionsProps {
  eventId: string;
  guestName: string;
  venueName: string;
  address: string;
}

export function InvitationActions({
  eventId,
  guestName,
  venueName,
  address,
}: InvitationActionsProps) {
  // Estado para mensagem aos noivos
  const [message, setMessage] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  // Estado para cópia de dados de presentes
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Link para Google Maps
  const mapsQuery = encodeURIComponent(`${venueName}, ${address}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setMsgSending(true);
    setMsgError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          body: message.trim(),
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Erro ao enviar mensagem");
      }

      setMsgSent(true);
      setMessage("");
    } catch (err) {
      setMsgError(err instanceof Error ? err.message : "Erro ao enviar mensagem");
    } finally {
      setMsgSending(false);
    }
  }

  function copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  }

  return (
    <div className="mt-8 space-y-6">
      {/* 1. LOCALIZAÇÃO / GOOGLE MAPS */}
      <div className="rounded-2xl border border-[#C5A059]/20 bg-white p-5 shadow-sm text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#C5A059]/10 text-[#C5A059] mb-3">
          <MapPin className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-gray-900">{venueName}</h3>
        <p className="mt-1 text-sm text-gray-500">{address}</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#333]"
        >
          <MapPin className="h-4 w-4 text-[#C5A059]" />
          Ver no Google Maps
        </a>
      </div>

      {/* 2. PRESENTES / CONTAS (M-Pesa, e-Mola, BIM/IBAN) */}
      <div className="rounded-2xl border border-[#C5A059]/20 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="h-5 w-5 text-[#C5A059]" />
          <h3 className="font-semibold text-gray-900">Lista de Presentes</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          A vossa presença é o nosso maior presente! Se desejarem presentear os noivos, deixamos os nossos contactos directos:
        </p>

        <div className="space-y-2.5">
          {/* M-Pesa */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FDFBF7] p-3 text-sm">
            <div>
              <p className="font-semibold text-red-600">M-Pesa</p>
              <p className="text-xs text-gray-600 font-mono">+258 84 123 4567</p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard("+258 84 123 4567", "mpesa")}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              {copiedType === "mpesa" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* e-Mola */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FDFBF7] p-3 text-sm">
            <div>
              <p className="font-semibold text-amber-600">e-Mola</p>
              <p className="text-xs text-gray-600 font-mono">+258 86 123 4567</p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard("+258 86 123 4567", "emola")}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              {copiedType === "emola" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Millennium BIM / Conta Bancária */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#FDFBF7] p-3 text-sm">
            <div>
              <p className="font-semibold text-[#8B5A2B]">Millennium BIM / IBAN</p>
              <p className="text-xs text-gray-600 font-mono">0001 0000 1234 5678 9012 3</p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard("000100001234567890123", "iban")}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              {copiedType === "iban" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MENSAGEM AOS NOIVOS (INPUT) */}
      <div className="rounded-2xl border border-[#C5A059]/20 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-5 w-5 text-[#C5A059]" />
          <h3 className="font-semibold text-gray-900">Deixe uma mensagem aos noivos</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Escreva votos de felicidade ou uma mensagem carinhosa para o casal:
        </p>

        {msgSent ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <Check className="mx-auto h-6 w-6 text-emerald-600 mb-1" />
            <p className="text-sm font-semibold text-emerald-800">Mensagem enviada com sucesso!</p>
            <p className="text-xs text-emerald-600 mt-0.5">Os noivos ficarão muito felizes com os vossos votos.</p>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-3">
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Muitas felicidades nesta nova etapa! Mal posso esperar pelo grande dia..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
            />

            {msgError && (
              <p className="text-xs text-red-600">{msgError}</p>
            )}

            <button
              type="submit"
              disabled={msgSending || !message.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b08f4a] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {msgSending ? "A enviar..." : "Enviar mensagem aos noivos"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
