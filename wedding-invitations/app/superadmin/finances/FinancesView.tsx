"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Layers,
  Users,
  TestTube2,
} from "lucide-react";

interface PaymentItem {
  id: string;
  eventId: string;
  type: "TEMPLATE" | "GUEST_FEE";
  amountCents: number;
  amountMzn: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  provider: string;
  providerRef: string | null;
  isSandbox: boolean;
  confirmedAt: string | null;
  createdAt: string;
  event: {
    id: string;
    brideName: string;
    groomName: string;
    weddingDate: string;
    templateSlug: string;
    organizerName: string;
    organizerEmail: string;
    organizerPhone: string;
  } | null;
}

export function FinancesView({ payments }: { payments: PaymentItem[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "TEMPLATE" | "GUEST_FEE">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING" | "FAILED">("ALL");
  const [envFilter, setEnvFilter] = useState<"ALL" | "LIVE" | "SANDBOX">("ALL");

  // Cálculos de KPIs
  const stats = useMemo(() => {
    let totalLiveMzn = 0;
    let templateLiveMzn = 0;
    let guestFeeLiveMzn = 0;
    let sandboxMzn = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    for (const p of payments) {
      if (p.status === "PAID") {
        paidCount++;
        if (p.isSandbox) {
          sandboxMzn += p.amountMzn;
        } else {
          totalLiveMzn += p.amountMzn;
          if (p.type === "TEMPLATE") templateLiveMzn += p.amountMzn;
          if (p.type === "GUEST_FEE") guestFeeLiveMzn += p.amountMzn;
        }
      } else if (p.status === "PENDING") {
        pendingCount++;
      } else {
        failedCount++;
      }
    }

    return {
      totalLiveMzn,
      templateLiveMzn,
      guestFeeLiveMzn,
      sandboxMzn,
      paidCount,
      pendingCount,
      failedCount,
      totalCount: payments.length,
    };
  }, [payments]);

  // Filtragem da lista
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (envFilter === "LIVE" && p.isSandbox) return false;
      if (envFilter === "SANDBOX" && !p.isSandbox) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const ref = (p.providerRef || "").toLowerCase();
        const bride = (p.event?.brideName || "").toLowerCase();
        const groom = (p.event?.groomName || "").toLowerCase();
        const orgName = (p.event?.organizerName || "").toLowerCase();
        const orgEmail = (p.event?.organizerEmail || "").toLowerCase();

        return (
          ref.includes(q) ||
          bride.includes(q) ||
          groom.includes(q) ||
          orgName.includes(q) ||
          orgEmail.includes(q)
        );
      }

      return true;
    });
  }, [payments, typeFilter, statusFilter, envFilter, search]);

  // Exportar para CSV
  function handleExportCsv() {
    const headers = [
      "Data",
      "Referencia NetShop",
      "Tipo",
      "Ambiente",
      "Montante (MZN)",
      "Estado",
      "Noivos",
      "Organizador",
      "Email Organizador",
    ];

    const rows = filteredPayments.map((p) => [
      new Date(p.createdAt).toLocaleString("pt-PT"),
      p.providerRef || "-",
      p.type === "TEMPLATE" ? "Template" : "Taxa Convidados",
      p.isSandbox ? "Sandbox" : "Producao",
      p.amountMzn,
      p.status,
      p.event ? `${p.event.brideName} & ${p.event.groomName}` : "-",
      p.event?.organizerName || "-",
      p.event?.organizerEmail || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((r) => r.map((c) => `"${c}"`).join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio-financeiro-doremi-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-8">
      {/* Topo com Título e Ações de Exportação */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif-custom font-bold text-gray-900">
            Facturação &amp; Relatórios Financeiros
          </h1>
          <p className="text-sm text-gray-500">
            Controlo geral de receitas, taxas de convidados e transações NetShop
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            <Download className="h-4 w-4 text-gray-500" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
          >
            <Printer className="h-4 w-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Cartões de KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Receita Total Real */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Facturação Líquida (Produção)
            </span>
            <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-950 font-sans">
            {stats.totalLiveMzn.toLocaleString("pt-PT")} <span className="text-lg">MT</span>
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            {stats.paidCount} transações pagas confirmadas
          </p>
        </div>

        {/* Templates Vendidos */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Venda de Modelos (Templates)
            </span>
            <span className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <Layers className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-950 font-sans">
            {stats.templateLiveMzn.toLocaleString("pt-PT")} <span className="text-lg">MT</span>
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Receita obtida da ativação de convites
          </p>
        </div>

        {/* Taxas por Convidado */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              Taxas de Convidados (25 MT/conv)
            </span>
            <span className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-blue-950 font-sans">
            {stats.guestFeeLiveMzn.toLocaleString("pt-PT")} <span className="text-lg">MT</span>
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Receita de geração de QR Codes e convites
          </p>
        </div>

        {/* Modo Sandbox & Estatísticas */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
              Testes Sandbox (10 MT)
            </span>
            <span className="rounded-xl bg-purple-100 p-2 text-purple-700">
              <TestTube2 className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-purple-950 font-sans">
            {stats.sandboxMzn.toLocaleString("pt-PT")} <span className="text-lg">MT</span>
          </p>
          <p className="mt-1 text-xs text-purple-700">
            {stats.pendingCount} pagamentos pendentes no gateway
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Campo de Pesquisa */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por noivos, organizador, referência..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Filtros em Abas/Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro Tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "ALL" | "TEMPLATE" | "GUEST_FEE")}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="TEMPLATE">Modelos (Templates)</option>
              <option value="GUEST_FEE">Taxas de Convidados</option>
            </select>

            {/* Filtro Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PAID" | "PENDING" | "FAILED")}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">Todos os Estados</option>
              <option value="PAID">Pagos (Confirmados)</option>
              <option value="PENDING">Pendentes</option>
              <option value="FAILED">Falhados</option>
            </select>

            {/* Filtro Ambiente */}
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value as "ALL" | "LIVE" | "SANDBOX")}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">Todos os Ambientes</option>
              <option value="LIVE">Produção (Real)</option>
              <option value="SANDBOX">Sandbox (Testes)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
          <span>A mostrar {filteredPayments.length} de {payments.length} transações</span>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Nenhuma transação encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Data / Hora</th>
                  <th className="px-4 py-3">Referência NetShop</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Evento &amp; Casal</th>
                  <th className="px-4 py-3">Organizador</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Ambiente</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredPayments.map((p) => {
                  const date = new Date(p.createdAt);
                  const formattedDate = date.toLocaleDateString("pt-PT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = date.toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/75 transition">
                      <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">
                        <span className="font-semibold text-gray-900 block">{formattedDate}</span>
                        <span className="text-gray-400 text-[10px]">{formattedTime}</span>
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-gray-900">
                        {p.providerRef || (
                          <span className="text-gray-400 italic">Sem ref</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {p.type === "TEMPLATE" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 border border-amber-200">
                            <Layers className="h-3 w-3" /> Modelo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800 border border-blue-200">
                            <Users className="h-3 w-3" /> Taxa Convidados
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {p.event ? (
                          <div>
                            <span className="font-semibold text-gray-900 block">
                              {p.event.brideName} &amp; {p.event.groomName}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Modelo: {p.event.templateSlug}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Evento removido</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {p.event ? (
                          <div>
                            <span className="font-medium text-gray-900 block">
                              {p.event.organizerName}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                              {p.event.organizerEmail}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-gray-900 font-sans text-sm">
                        {p.amountMzn.toLocaleString("pt-PT")} MT
                      </td>

                      <td className="px-4 py-3 text-center">
                        {p.isSandbox ? (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-800">
                            Sandbox
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                            Produção
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {p.status === "PAID" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Pago
                          </span>
                        ) : p.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                            <Clock className="h-3 w-3" /> Pendente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
                            <XCircle className="h-3 w-3" /> Falhado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
