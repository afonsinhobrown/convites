import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { extractTemplateDefaultData } from "@/lib/designer-layout";
import { NewEventForm } from "./NewEventForm";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Personalizar Convite — Organizador",
};

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: { template?: string };
}) {
  const organizerId = await getCurrentOrganizerId();
  if (!organizerId) {
    const qs = searchParams.template ? `?template=${encodeURIComponent(searchParams.template)}` : "";
    redirect(`/organizer/auth${qs}`);
  }

  const templates = await prisma.invitationTemplate.findMany({
    where: { status: "PUBLISHED", active: true },
    orderBy: { sortOrder: "asc" },
  });

  const selectedSlug =
    searchParams.template && templates.some((t) => t.slug === searchParams.template)
      ? searchParams.template
      : templates[0]?.slug ?? "magnolia-casal";

  const currentTemplate = templates.find((t) => t.slug === selectedSlug);

  // Obter os dados configurados e publicados pelo designer para este modelo específico
  const defaultValues = extractTemplateDefaultData(currentTemplate ?? { slug: selectedSlug });

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
              Personalizar novo convite
            </h1>
            <p className="text-sm text-gray-500">
              Preencha os detalhes do casamento a partir do modelo selecionado
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <NewEventForm
          initialTemplateSlug={selectedSlug}
          templates={templates}
          defaultValues={defaultValues}
        />
      </div>
    </main>
  );
}
