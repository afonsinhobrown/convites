"use client";

import { useState } from "react";
import Link from "next/link";
import type { Designer, InvitationTemplate } from "@prisma/client";

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const STATUS_LABEL: Record<Status, string> = {
  PUBLISHED: "Publicado",
  DRAFT: "Rascunho",
  ARCHIVED: "Arquivado",
};

const STATUS_CLASS: Record<Status, string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  DRAFT: "bg-amber-100 text-amber-700",
  ARCHIVED: "bg-gray-200 text-gray-500",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function TemplateCard({
  template,
  onStatusChange,
}: {
  template: InvitationTemplate;
  onStatusChange: (slug: string, next: Status) => void;
}) {
  const [loading, setLoading] = useState(false);
  const status = template.status as Status;

  async function toggleStatus() {
    const next: Status = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setLoading(true);
    try {
      const res = await fetch(`/api/designer/templates/${template.slug}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        onStatusChange(template.slug, next);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erro ao mudar estado");
      }
    } finally {
      setLoading(false);
    }
  }

  async function archiveTemplate() {
    if (!confirm(`Arquivar "${template.name}"? Ficará invisível na montra.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/designer/templates/${template.slug}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (res.ok) {
        onStatusChange(template.slug, "ARCHIVED");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erro ao arquivar");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Preview thumbnail */}
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100" style={{ aspectRatio: "3/4" }}>
        {template.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.previewUrl}
            alt={template.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-4xl">🖼️</div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="font-semibold text-gray-900">{template.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{template.slug}</p>
          <p className="text-sm font-medium text-rose-600 mt-1">
            {template.priceUsdCents != null ? `$${(template.priceUsdCents / 100).toFixed(0)}` : "—"}
          </p>
        </div>

        {template.publishedAt && status === "PUBLISHED" && (
          <p className="text-[11px] text-gray-400">
            Publicado em {new Date(template.publishedAt).toLocaleDateString("pt-PT")}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-1.5">
          <Link
            href={`/designer/editor/${template.slug}`}
            className="rounded-lg bg-rose-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-rose-700"
          >
            ✏️ Editar Layout
          </Link>

          <button
            onClick={toggleStatus}
            disabled={loading || status === "ARCHIVED"}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : status === "PUBLISHED" ? "Despublicar" : "Publicar"}
          </button>

          {status !== "ARCHIVED" && (
            <button
              onClick={archiveTemplate}
              disabled={loading}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              Arquivar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DesignerDashboard({
  designer,
  templates: initial,
}: {
  designer: Designer;
  templates: InvitationTemplate[];
}) {
  const [templates, setTemplates] = useState(initial);

  function handleStatusChange(slug: string, next: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    setTemplates((prev) =>
      prev.map((t) =>
        t.slug === slug
          ? {
              ...t,
              status: next,
              publishedAt: next === "PUBLISHED" ? new Date() : t.publishedAt,
            }
          : t
      )
    );
  }

  const published = templates.filter((t) => t.status === "PUBLISHED");
  const draft = templates.filter((t) => t.status === "DRAFT");
  const archived = templates.filter((t) => t.status === "ARCHIVED");

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Painel do Designer</h1>
            <p className="text-sm text-gray-500">Olá, {designer.name} · {templates.length} templates</p>
          </div>
          <form action="/api/designer/logout" method="POST">
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Publicados", count: published.length, color: "text-emerald-600" },
            { label: "Rascunhos", count: draft.length, color: "text-amber-600" },
            { label: "Arquivados", count: archived.length, color: "text-gray-500" },
          ].map(({ label, count, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center">
              <p className={`text-3xl font-bold ${color}`}>{count}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        {[
          { title: "✅ Publicados", items: published },
          { title: "✏️ Rascunhos", items: draft },
          { title: "🗄️ Arquivados", items: archived },
        ].map(({ title, items }) =>
          items.length === 0 ? null : (
            <section key={title}>
              <h2 className="mb-4 text-lg font-semibold text-gray-700">{title}</h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((t) => (
                  <TemplateCard key={t.slug} template={t} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </section>
          )
        )}
      </div>
    </main>
  );
}
