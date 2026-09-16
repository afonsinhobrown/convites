"use client";

import { useState } from "react";
import { FileText, Users, MessageSquare, Gift, MessageCircle, Download, Loader2 } from "lucide-react";

interface ReportsSectionProps {
  eventId: string;
  counts: {
    guests: number;
    confirmed: number;
    messages: number;
    gifts: number;
    whatsAppLogs: number;
  };
}

export function ReportsSection({ eventId, counts }: ReportsSectionProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownloadReport(type: "rsvp" | "messages" | "gifts" | "whatsapp") {
    setDownloading(type);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/reports/${type}`);
      if (!res.ok) throw new Error("Erro ao gerar relatório");

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : `relatorio_${type}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao transferir relatório:", err);
      alert("Erro ao transferir o relatório em PDF. Tente novamente.");
    } finally {
      setDownloading(null);
    }
  }

  const reports = [
    {
      id: "rsvp" as const,
      title: "Lista de Presenças & RSVP",
      desc: "Estatísticas de confirmados, acompanhantes e restrições alimentares.",
      badge: `${counts.confirmed} confirmados de ${counts.guests}`,
      icon: Users,
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-800",
      btnColor: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      id: "messages" as const,
      title: "Livro de Mensagens",
      desc: "Todas as dedicatórias e votos carinhosos deixados pelos convidados.",
      badge: `${counts.messages} mensagens`,
      icon: MessageSquare,
      color: "border-amber-200 bg-amber-50/50 text-amber-800",
      btnColor: "bg-amber-600 hover:bg-amber-700",
    },
    {
      id: "gifts" as const,
      title: "Registo de Presentes",
      desc: "Lista de contas bancárias, M-Pesa, E-Mola e lista de desejos cadastrados.",
      badge: `${counts.gifts} opções ativas`,
      icon: Gift,
      color: "border-[#C5A059]/30 bg-[#FDFBF7] text-[#8B5A2B]",
      btnColor: "bg-[#C5A059] hover:bg-[#b08f4a]",
    },
    {
      id: "whatsapp" as const,
      title: "Histórico de WhatsApp",
      desc: "Relatório cronológico de todos os convites disparados via WhatsApp.",
      badge: `${counts.whatsAppLogs} disparos`,
      icon: MessageCircle,
      color: "border-teal-200 bg-teal-50/50 text-teal-800",
      btnColor: "bg-teal-600 hover:bg-teal-700",
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b pb-4">
        <FileText className="h-5 w-5 text-[#C5A059]" />
        <div>
          <h3 className="text-base font-bold text-gray-900">Relatórios Oficiais em PDF</h3>
          <p className="text-xs text-gray-500">
            Descarregue relatórios formatados para impressão ou arquivo do evento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map((r) => {
          const Icon = r.icon;
          const isLoading = downloading === r.id;

          return (
            <div
              key={r.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition hover:shadow-md ${r.color}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <h4 className="text-sm font-bold">{r.title}</h4>
                  </div>
                  <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold shadow-xs">
                    {r.badge}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">{r.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadReport(r.id)}
                disabled={isLoading}
                className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 ${r.btnColor}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    A gerar PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    Descarregar PDF
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
