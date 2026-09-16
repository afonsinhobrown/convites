"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users, Sparkles } from "lucide-react";

export function GuestForm({
  eventId,
  isSandbox = false,
  currentCount = 0,
}: {
  eventId: string;
  isSandbox?: boolean;
  currentCount?: number;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"single" | "bulk">("single");

  // Formulário Individual
  const [form, setForm] = useState({ name: "", phone: "", email: "", maxCompanions: "0" });
  // Formulário em Lote
  const [bulkText, setBulkText] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAtLimit = isSandbox && currentCount >= 6;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSingleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          maxCompanions: Number(form.maxCompanions),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao adicionar convidado");
        return;
      }
      setForm({ name: "", phone: "", email: "", maxCompanions: "0" });
      setSuccess(`${data.name} adicionado com sucesso.`);
      router.refresh();
    } catch {
      setError("Erro de ligação ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError("Introduza pelo menos um nome de convidado.");
      setLoading(false);
      return;
    }

    // Processar cada linha (suporta "Nome", ou "Nome, Telefone", ou "Nome, Telefone, Acompanhantes")
    const guests = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const name = parts[0] || "";
      const phone = parts[1] || "";
      const maxCompanions = parts[2] ? parseInt(parts[2], 10) || 0 : 0;
      return { name, phone, maxCompanions };
    });

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao importar lista de convidados");
        return;
      }
      setBulkText("");
      setSuccess(`${data.count || guests.length} convidados importados com sucesso!`);
      router.refresh();
    } catch {
      setError("Erro de ligação ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]";

  return (
    <div className="rounded-2xl border border-[#C5A059]/20 bg-white p-5 shadow-sm">
      {isSandbox && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <div className="flex items-center justify-between font-semibold">
            <span>🧪 Evento em Modo Sandbox</span>
            <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[11px]">
              {currentCount} / 6 convidados
            </span>
          </div>
          <p className="mt-1 text-[11px] text-amber-800">
            O modo sandbox permite testar todas as funcionalidades até um limite de 6 convidados.
          </p>
        </div>
      )}

      {/* Abas */}
      <div className="flex border-b border-gray-100 mb-4 pb-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setTab("single");
            setError(null);
            setSuccess(null);
          }}
          className={`flex items-center gap-1.5 pb-1 text-sm font-medium transition ${
            tab === "single"
              ? "border-b-2 border-[#C5A059] text-[#C5A059]"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Individual
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("bulk");
            setError(null);
            setSuccess(null);
          }}
          className={`flex items-center gap-1.5 pb-1 text-sm font-medium transition ${
            tab === "bulk"
              ? "border-b-2 border-[#C5A059] text-[#C5A059]"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Users className="h-4 w-4" />
          Em lista / Lote
        </button>
      </div>

      {tab === "single" ? (
        <form onSubmit={handleSingleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
                Nome do convidado
              </label>
              <input
                id="guestName"
                type="text"
                required
                disabled={isAtLimit}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ex: Maria Nhantumbo"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700">
                Telefone (WhatsApp)
              </label>
              <input
                id="guestPhone"
                type="tel"
                disabled={isAtLimit}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="Ex: +258 84 123 4567"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700">
                Email (opcional)
              </label>
              <input
                id="guestEmail"
                type="email"
                disabled={isAtLimit}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="Ex: maria@email.com"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="guestCompanions" className="block text-sm font-medium text-gray-700">
                Acompanhantes
              </label>
              <input
                id="guestCompanions"
                type="number"
                min={0}
                max={9}
                disabled={isAtLimit}
                value={form.maxCompanions}
                onChange={(e) => update("maxCompanions", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isAtLimit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C5A059] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#b08f4a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "A adicionar..." : isAtLimit ? "Limite Sandbox atingido (6/6)" : "Adicionar convidado"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colar lista de convidados (um por linha)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Formato: <strong>Nome</strong> ou <strong>Nome, Telefone</strong> ou <strong>Nome, Telefone, Nº Acompanhantes</strong>
            </p>
            <textarea
              rows={5}
              required
              disabled={isAtLimit}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"Carlos Macuácua, +258840001111, 1\nBeatriz Cossa, +258820002222\nDr. Fernando Silva"}
              className={inputClass}
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isAtLimit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "A importar lista..." : isAtLimit ? "Limite Sandbox atingido (6/6)" : "Importar todos"}
          </button>
        </form>
      )}
    </div>
  );
}