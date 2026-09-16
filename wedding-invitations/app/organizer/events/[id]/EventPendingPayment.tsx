"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Loader2,
  Lock,
  Trash2,
} from "lucide-react";

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
  sandboxAllowed?: boolean;
}

export function EventPendingPayment({ event, template, sandboxAllowed = true }: EventPendingPaymentProps) {
  const router = useRouter();
  const [method, setMethod] = useState<"mpesa" | "card">("mpesa");
  const [isSandbox, setIsSandbox] = useState(false);

  // Só pré-preenche se o contacto do evento for Vodacom (84 ou 85), senão deixa em branco
  const initialPhone = (() => {
    const clean = (event.rsvpContact || "").replace(/\D/g, "");
    const local = clean.startsWith("258") ? clean.slice(3) : clean;
    return local.startsWith("84") || local.startsWith("85") ? local.slice(0, 9) : "";
  })();

  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Polling automático para detetar a confirmação do pagamento (webhook da NetShop)
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
    }, 3000);

    return () => clearInterval(interval);
  }, [event.id, router]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    let cleanMsisdn = "";

    // Validação específica de M-Pesa (Vodacom)
    if (method === "mpesa") {
      let localDigits = phone.replace(/\D/g, "");
      if (localDigits.startsWith("258") && localDigits.length > 9) {
        localDigits = localDigits.slice(3);
      }
      if (!localDigits.startsWith("84") && !localDigits.startsWith("85")) {
        setError(
          "Para pagar via M-Pesa é necessário um número Vodacom (iniciado por 84 ou 85). Se utiliza outro operador/banco, selecione 'BIM / Cartão'."
        );
        return;
      }
      if (localDigits.length !== 9) {
        setError("O número de telefone deve ter exatamente 9 dígitos (ex: 847981166).");
        return;
      }
      cleanMsisdn = `258${localDigits}`;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/organizer/events/${event.id}/payment/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, phone: cleanMsisdn || phone, isSandbox }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar pagamento na NetShop");
      }

      if (data.paid) {
        router.refresh();
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setSuccessMsg(
          "Pedido de pagamento enviado para o seu telefone. Confirme a transação inserindo o seu PIN no M-Pesa."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEvent() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/organizer/events/${event.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Erro ao desfazer o evento");
      }
      router.push("/organizer");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao desfazer evento");
      setDeleting(false);
      setConfirmDelete(false);
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

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Resumo do Evento */}
          <div className="rounded-2xl border border-[#C5A059]/30 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif-custom text-lg font-bold text-gray-900">
                Resumo do Evento
              </h3>

              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Noivos:</span>
                  <span className="font-medium text-gray-900">
                    {event.brideName} &amp; {event.groomName}
                  </span>
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
                  <span className="text-[#C5A059]">
                    {isSandbox ? "10 MT (doremi modo sandbox)" : `${template.priceMzn} MT`}
                  </span>
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
                    Geração de convites individuais com QR Code
                  </li>
                </ul>
              </div>
            </div>

            {/* Opção de Desfazer / Cancelar o Evento */}
            <div className="mt-8 border-t pt-4">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Desfazer / Cancelar este evento
                </button>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs">
                  <p className="font-medium text-red-800 mb-2">
                    Tem a certeza de que deseja cancelar e eliminar este evento?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteEvent}
                      disabled={deleting}
                      className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting ? "A eliminar..." : "Sim, eliminar evento"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulário de Pagamento NetShop */}
          <div className="rounded-2xl border border-[#C5A059]/30 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif-custom text-lg font-bold text-gray-900">
                Pagar com NetShop
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Selecione o método de pagamento para activar o seu evento.
              </p>

              <form onSubmit={handlePay} className="mt-5 space-y-4">
                {/* Seleção do Método */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod("mpesa");
                      setError(null);
                    }}
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
                    onClick={() => {
                      setMethod("card");
                      setError(null);
                    }}
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

                {method === "mpesa" ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      Número Vodacom (84 ou 85)
                    </label>
                    <div className="mt-1 flex rounded-lg shadow-sm">
                      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-3.5 text-sm font-bold text-gray-700 select-none">
                        +258
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={9}
                        value={phone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.startsWith("258") && val.length > 9) {
                            val = val.slice(3);
                          }
                          setPhone(val.slice(0, 9));
                        }}
                        placeholder="847981166"
                        className="block w-full rounded-r-lg border border-gray-300 px-3.5 py-2.5 text-base font-medium tracking-wider focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Introduza apenas os 9 dígitos (ex: 847981166). O prefixo +258 é adicionado automaticamente.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#FDFBF7] p-3 text-xs text-gray-600 border border-gray-200">
                    Ao clicar em Pagar, será direcionado para o ambiente seguro do Millennium BIM / Cartão para introduzir os dados do cartão.
                  </div>
                )}

                {/* Checkbox Sandbox */}
                {sandboxAllowed && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50/70 p-3">
                    <input
                      id="template-sandbox-toggle"
                      type="checkbox"
                      checked={isSandbox}
                      onChange={(e) => setIsSandbox(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <label
                      htmlFor="template-sandbox-toggle"
                      className="text-xs font-semibold text-amber-900 cursor-pointer select-none"
                    >
                      Activar modo sandbox (10 MT — doremi modo sandbox)
                    </label>
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
                    <>
                      Pagar agora (
                      {isSandbox ? "10 MT — doremi modo sandbox" : `${template.priceMzn} MT`}
                      ) →
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
