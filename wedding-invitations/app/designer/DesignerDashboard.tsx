"use client";

import { useState } from "react";
import Link from "next/link";
import type { Designer, InvitationTemplate } from "@prisma/client";
import { TemplatePreview } from "@/components/invitations/TemplatePreview";

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
  onDelete,
}: {
  template: InvitationTemplate;
  onStatusChange: (slug: string, next: Status) => void;
  onDelete: (slug: string) => void;
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
      if (res.ok) onStatusChange(template.slug, next);
      else alert((await res.json().catch(() => ({}))).error ?? "Erro ao mudar estado");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate() {
    if (!confirm(`Eliminar permanentemente "${template.name}"? Esta ação não pode ser desfeita.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/designer/templates/${template.slug}`, { method: "DELETE" });
      if (res.ok) onDelete(template.slug);
      else alert((await res.json().catch(() => ({}))).error ?? "Erro ao eliminar");
    } finally {
      setLoading(false);
    }
  }

  async function duplicateTemplate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/designer/templates/${template.slug}/duplicate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Recarrega para obter o novo template da BD
        window.location.reload();
      } else {
        alert(data.error ?? "Erro ao duplicar");
      }
    } finally {
      setLoading(false);
    }
  }

  async function archiveTemplate() {
    if (!confirm(`Arquivar "${template.name}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/designer/templates/${template.slug}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (res.ok) onStatusChange(template.slug, "ARCHIVED");
      else alert((await res.json().catch(() => ({}))).error ?? "Erro ao arquivar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Preview — usa TemplatePreview real (mostra layoutJson actual) */}
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100" style={{ aspectRatio: "2/3" }}>
        <TemplatePreview
          slug={template.slug}
          name={template.name}
          componentName={template.componentName}
          previewUrl={template.previewUrl}
          layoutJson={template.layoutJson}
          demoData={template.demoData}
          className="h-full w-full"
        />
        <div className="absolute top-2 left-2">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">{template.name}</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">{template.slug}</p>
          <p className="text-sm font-medium text-rose-600 mt-1">
            ${(template.priceUsdCents / 100).toFixed(0)}
          </p>
        </div>

        {template.publishedAt && status === "PUBLISHED" && (
          <p className="text-[10px] text-gray-400">
            Publicado {new Date(template.publishedAt).toLocaleDateString("pt-PT")}
          </p>
        )}

        {/* Acções */}
        <div className="mt-auto flex flex-col gap-1">
          <Link
            href={`/designer/editor/${template.slug}`}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-rose-700"
          >
            ✏️ Editar Layout
          </Link>

          {/* Publicar / Despublicar */}
          {status !== "ARCHIVED" && (
            <button
              onClick={toggleStatus}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "..." : status === "PUBLISHED" ? "⬇ Despublicar" : "⬆ Publicar"}
            </button>
          )}

          {/* Duplicar (só PUBLISHED) */}
          {status === "PUBLISHED" && (
            <button
              onClick={duplicateTemplate}
              disabled={loading}
              className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {loading ? "..." : "⎘ Criar variante (DRAFT)"}
            </button>
          )}

          {/* Arquivar (PUBLISHED → ARCHIVED) */}
          {status === "PUBLISHED" && (
            <button
              onClick={archiveTemplate}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              🗄 Arquivar
            </button>
          )}

          {/* Eliminar (só DRAFT) */}
          {status === "DRAFT" && (
            <button
              onClick={deleteTemplate}
              disabled={loading}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {loading ? "..." : "🗑 Eliminar rascunho"}
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

  function handleStatusChange(slug: string, next: Status) {
    setTemplates((prev) =>
      prev.map((t) =>
        t.slug === slug
          ? { ...t, status: next, publishedAt: next === "PUBLISHED" ? new Date() : t.publishedAt }
          : t
      )
    );
  }

  function handleDelete(slug: string) {
    setTemplates((prev) => prev.filter((t) => t.slug !== slug));
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

        {/* Secções por status */}
        {[
          { title: "✅ Publicados", items: published },
          { title: "✏️ Rascunhos", items: draft },
          { title: "🗄️ Arquivados", items: archived },
        ].map(({ title, items }) =>
          items.length === 0 ? null : (
            <section key={title}>
              <h2 className="mb-4 text-lg font-semibold text-gray-700">{title}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((t) => (
                  <TemplateCard
                    key={t.slug}
                    template={t}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )
        )}
      </div>
    </main>
  );
}
