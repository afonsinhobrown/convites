"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Loader2,
  QrCode,
  CalendarCheck,
} from "lucide-react";

interface EventStatusAndScannerProps {
  eventId: string;
  initialStatus: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  initialSecurityPin: string;
  completedAt?: string | null;
}

export function EventStatusAndScanner({
  eventId,
  initialStatus,
  initialSecurityPin,
  completedAt,
}: EventStatusAndScannerProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pin, setPin] = useState(initialSecurityPin || "1234");
  const [editingPin, setEditingPin] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  const scannerUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/scanner/${eventId}`;

  async function handleToggleStatus() {
    const nextStatus = status === "ACTIVE" ? "COMPLETED" : "ACTIVE";
    const confirmMsg =
      nextStatus === "COMPLETED"
        ? "Tem a certeza de que deseja marcar o casamento como CONCLUÍDO?"
        : "Reabrir o evento para modo ativo?";
    if (!confirm(confirmMsg)) return;

    setTogglingStatus(true);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setStatus(nextStatus);
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao alterar estado do evento:", err);
    } finally {
      setTogglingStatus(false);
    }
  }

  async function handleSavePin(e: React.FormEvent) {
    e.preventDefault();
    setSavingPin(true);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ securityPin: pin }),
      });
      if (res.ok) {
        setEditingPin(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao guardar PIN:", err);
    } finally {
      setSavingPin(false);
    }
  }

  function handleCopyScannerLink() {
    navigator.clipboard.writeText(scannerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#C5A059]" />
            <h3 className="text-base font-bold text-gray-900">Portaria &amp; Conclusão do Evento</h3>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            Controlo de check-in na receção e encerramento oficial do casamento.
          </p>
        </div>

        {/* Botão de Finalizar Evento */}
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={togglingStatus}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
            status === "COMPLETED"
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          } disabled:opacity-50`}
        >
          {togglingStatus ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : status === "COMPLETED" ? (
            <CalendarCheck className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {status === "COMPLETED" ? "Evento Concluído (Reabrir)" : "Marcar Evento como Concluído"}
        </button>
      </div>

      {status === "COMPLETED" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>
              Este evento foi marcado como <strong>Concluído</strong>
              {completedAt &&
                ` em ${new Date(completedAt).toLocaleDateString("pt-MZ")}`}
              . Todos os dados e relatórios permanecem disponíveis para consulta.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card do Link do Scanner da Portaria */}
        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="h-4 w-4 text-[#8B5A2B]" />
              <h4 className="text-sm font-bold text-gray-900">Link do Scanner para a Portaria</h4>
            </div>
            <p className="text-xs text-gray-600">
              Partilhe este link com a equipa de receção/portaria para validação de QR Code em tempo real.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={`/scanner/${eventId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C5A059] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#b08f4a] transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir Scanner
            </a>
            <button
              type="button"
              onClick={handleCopyScannerLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Link Copiado!" : "Copiar Link"}
            </button>
          </div>
        </div>

        {/* Card do PIN de Segurança da Portaria */}
        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-[#8B5A2B]" />
              <h4 className="text-sm font-bold text-gray-900">PIN de Segurança da Portaria</h4>
            </div>
            <p className="text-xs text-gray-600">
              PIN necessário para aceder ao leitor da câmara e confirmar entradas.
            </p>
          </div>

          <div className="mt-4">
            {!editingPin ? (
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold tracking-widest text-gray-900 bg-white px-3 py-1 rounded-lg border">
                  {pin}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingPin(true)}
                  className="text-xs font-semibold text-[#C5A059] hover:underline"
                >
                  Alterar PIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleSavePin} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  pattern="[0-9]*"
                  minLength={4}
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-28 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-center font-mono text-sm font-bold text-gray-900 focus:border-[#C5A059] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={savingPin}
                  className="rounded-lg bg-[#C5A059] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#b08f4a] disabled:opacity-50"
                >
                  {savingPin ? "..." : "Gravar"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPin(false)}
                  className="rounded-lg border bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
