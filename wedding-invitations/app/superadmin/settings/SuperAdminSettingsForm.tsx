"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface SystemConfigData {
  invitationFeeCents: number;
  bimExchangeRate: number;
  netshopEnabled: boolean;
  sandboxEnabled: boolean;
}

interface TemplateData {
  id: string;
  name: string;
  priceUsdCents: number;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}

export function SuperAdminSettingsForm({
  initialConfig,
  initialTemplates,
}: {
  initialConfig: SystemConfigData;
  initialTemplates: TemplateData[];
}) {
  const [config, setConfig] = useState<SystemConfigData>(initialConfig);
  const [templates, setTemplates] = useState<TemplateData[]>(initialTemplates);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const feeInMeticais = (config.invitationFeeCents / 100).toFixed(2);

  function updateConfig<K extends keyof SystemConfigData>(key: K, value: SystemConfigData[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateTemplatePrice(id: string, priceUsdCents: number) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priceUsdCents } : t))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload = {
      invitationFeeCents: config.invitationFeeCents,
      bimExchangeRate: config.bimExchangeRate,
      netshopEnabled: config.netshopEnabled,
      sandboxEnabled: config.sandboxEnabled,
      templates: templates.map((t) => ({
        id: t.id,
        priceUsdCents: t.priceUsdCents,
      })),
    };

    try {
      const res = await fetch("/api/superadmin/system-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error ?? "Erro ao guardar configurações." });
        return;
      }

      setConfig({
        invitationFeeCents: data.config.invitationFeeCents,
        bimExchangeRate: data.config.bimExchangeRate,
        netshopEnabled: data.config.netshopEnabled,
        sandboxEnabled: data.config.sandboxEnabled ?? true,
      });
      setTemplates(
        data.templates.map((t: TemplateData) => ({
          id: t.id,
          name: t.name,
          priceUsdCents: t.priceUsdCents,
        }))
      );
      setFeedback({ type: "success", message: "Configurações guardadas com sucesso." });
    } catch {
      setFeedback({ type: "error", message: "Erro de ligação ao servidor. Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-semibold text-gray-900">Configurações do Sistema</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ajuste taxas, câmbio e preços dos convites. As alterações aplicam-se imediatamente.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <section className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Taxas e Câmbio</h2>

            <div>
              <label htmlFor="invitationFeeCents" className="block text-sm font-medium text-gray-700">
                Taxa por convidado (centavos)
              </label>
              <div className="mt-1 flex items-center gap-4">
                <input
                  id="invitationFeeCents"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={config.invitationFeeCents}
                  onChange={(e) => updateConfig("invitationFeeCents", Number(e.target.value))}
                  className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-500">= {feeInMeticais} MT</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Valor em centavos: divida por 100 para obter o montante em MT.</p>
            </div>

            <div>
              <label htmlFor="bimExchangeRate" className="block text-sm font-medium text-gray-700">
                Câmbio BIM (MT por USD)
              </label>
              <input
                id="bimExchangeRate"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={config.bimExchangeRate}
                onChange={(e) => updateConfig("bimExchangeRate", Number(e.target.value))}
                className="mt-1 block w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Pagamentos &amp; Sandbox</h2>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Netshop ativo</p>
                <p className="text-xs text-gray-500">Permitir pagamentos através da Netshop.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.netshopEnabled}
                onClick={() => updateConfig("netshopEnabled", !config.netshopEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  config.netshopEnabled ? "bg-emerald-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    config.netshopEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Modo Sandbox (Testes)</p>
                <p className="text-xs text-gray-600">
                  Habilitar opção de pagamentos sandbox (10 MT - doremi modo sandbox) nas telas de pagamento.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.sandboxEnabled}
                onClick={() => updateConfig("sandboxEnabled", !config.sandboxEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  config.sandboxEnabled ? "bg-emerald-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    config.sandboxEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Preço dos Convites</h2>

            <ul className="divide-y divide-gray-200">
              {templates.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">
                      = {(t.priceUsdCents / 100).toFixed(2)} USD ·{" "}
                      {((t.priceUsdCents / 100) * config.bimExchangeRate).toFixed(0)} MT
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Preço (centavos USD):</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      aria-label={`Preço em centavos de ${t.name}`}
                      value={t.priceUsdCents}
                      onChange={(e) => updateTemplatePrice(t.id, Number(e.target.value))}
                      className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-right text-sm text-gray-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {feedback && (
            <div
              role="alert"
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}