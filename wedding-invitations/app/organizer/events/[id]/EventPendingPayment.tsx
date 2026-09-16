"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, CreditCard, Smartphone, CheckCircle2, Loader2, Lock } from "lucide-react";

interface EventPendingPaymentProps {
  event: {
    id: string;
    brideName: string;
    groomName: string;
    ceremonyVenue: string;
    ceremonyTime: string;
    weddingDateFormatted: string;
    templateSlug: string;
    rsvpContact: string;
  };
  template: {
    name: string;
    previewUrl?: string | null;
    priceMzn: number;
  };
}

export function EventPendingPayment({ event, template }: EventPendingPaymentProps) {
  const router = useRouter();
  const [method, setMethod] = useState<"mpesa" | "card">("mpesa");
  const [phone, setPhone] = useState(event.rsvpContact || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Polling para verificar se o pagamento foi confirmado via webhook ou retorno
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/organizer/events/${event.id}/payment/template`);
        const data = await res.json();
        if (data.paid) {
          router.refresh();
        }
      } catch {
        // silencioso
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [event.id, router]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/organizer/events/${event.id}/payment/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      if (data.paid) {
        router.refresh();
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setSuccessMsg("Pedido de pagamento enviado para o seu telefone. Por favor confirme o PIN no M-Pesa.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  }

  async function handleManualCheck() {
    setChecking(true);
    try {
      const res = await fetch(`/api/organizer/events/${event.id}/payment/template`);
      const data = await res.json();
      if (data.paid) {
        router.refresh();
      } else {
        setError("Pagamento ainda não confirmado. Aguarde alguns instantes.");
      }
    } catch {
      setError("Erro ao verificar estado.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="border-b border-[#C5A059]/30 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <Link
              href="/organizer"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Link>
            <h1 className="mt-1 text-xl font-serif-custom font-bold text-[#1A1A1A]">
              {event.brideName} &amp; {event.groomName}
            </h1>
            <p className="text-sm text-gray-500">
              {event.weddingDateFormatted} · {event.ceremonyTime} · {event.ceremonyVenue}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <Lock className="h-3.5 w-3.5" />
            Aguardando Pagamento
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Banner de Aviso Destacado */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-100 p-2.5 text-amber-800">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-900">
                Este evento aguarda pagamento. Pague para ativar.
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                Para desbloquear a gestão de convidados, personalização dos textos, geração de links e descarregamento dos convites, efectue o pagamento do modelo escolhido.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Resumo do Evento */}
          <div className="rounded-2xl border border-[#C5A059]/30 bg-white p-6 shadow-sm">
            <h3 className="font-serif-custom text-lg font-bold text-gray-900">
              Resumo do Evento
            </h3>

            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Noivos:</span>
                <span className="font-medium text-gray-900">{event.brideName} &amp; {event.groomName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Data do Casamento:</span>
                <span className="font-medium text-gray-900">{event.weddingDateFormatted}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Local da Cerimónia:</span>
                <span className="font-medium text-gray-900">{event.ceremonyVenue}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Modelo Escolhido:</span>
                <span className="font-medium text-gray-900">{template.name}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-gray-900">
                <span>Total a pagar:</span>
                <span className="text-[#C5A059]">{template.priceMzn} MT</span>
              </div>
            </div>

            {/* Funcionalidades Bloqueadas */}
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Recursos desbloqueados após o pagamento:
              </p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Edição completa dos dados e textos do casal
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Adição e importação de lista de convidados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Geração de ligações de convite personalizadas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Descarregamento de convites digitais e para impressão
                </li>
              </ul>
            </div>
          </div>

          {/* Formulário de Pagamento NetShop */}
          <div className="rounded-2xl border border-[#C5A059]/30 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif-custom text-lg font-bold text-gray-900">
                Pagar com NetShop
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Selecione o método de pagamento preferido para activar o seu evento imediatamente.
              </p>

              <form onSubmit={handlePay} className="mt-5 space-y-4">
                {/* Seleção do Método */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod("mpesa")}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                      method === "mpesa"
                        ? "border-red-600 bg-red-50 text-red-700 font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Smartphone className="h-5 w-5 mb-1 text-red-600" />
                    <span className="text-sm">M-Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("card")}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                      method === "card"
                        ? "border-[#8B5A2B] bg-[#8B5A2B]/10 text-[#8B5A2B] font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mb-1 text-[#8B5A2B]" />
                    <span className="text-sm">BIM / Cartão</span>
                  </button>
                </div>

                {method === "mpesa" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Número M-Pesa (Vodacom)
                    </label>
                    <div className="mt-1 flex rounded-lg shadow-sm">
                      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-xs text-gray-500">
                        +258
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone.replace(/^\+?258/, "")}
                        onChange={(e) => setPhone(`+258${e.target.value.replace(/\D/g, "")}`)}
                        placeholder="841234567"
                        className="block w-full rounded-r-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C5A059] px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-[#b08f4a] transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    <>Pagar agora ({template.priceMzn} MT) →</>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 border-t pt-4 text-center">
              <button
                type="button"
                onClick={handleManualCheck}
                disabled={checking}
                className="text-xs text-gray-500 hover:text-gray-800 underline transition"
              >
                {checking ? "A verificar pagamento..." : "Já efetuou o pagamento? Clique para atualizar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
