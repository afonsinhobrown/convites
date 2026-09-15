import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/config";
import { TemplatePreview } from "@/components/invitations/TemplatePreview";
import { Watermark } from "@/components/Watermark";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const t = await prisma.invitationTemplate.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
  });
  if (!t) return { title: "Modelo não encontrado" };
  return {
    title: `${t.name} — Convites de Casamento | DoReMi Eventos`,
    description: t.description ?? `Modelo de convite digital ${t.name}. Personalize e partilhe com os seus convidados.`,
  };
}

export default async function TemplatePage({ params }: { params: { slug: string } }) {
  const [template, config] = await Promise.all([
    prisma.invitationTemplate.findUnique({
      where: { slug: params.slug, status: "PUBLISHED" },
    }),
    getSystemConfig(),
  ]);

  if (!template) notFound();

  const usd = (template.priceUsdCents / 100).toFixed(2);
  const mzn = Math.round((template.priceUsdCents / 100) * config.bimExchangeRate);

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Header DoReMi */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/doremi-logo.jpg"
              alt="DoReMi Eventos"
              width={120}
              height={30}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              ← Montra
            </Link>
            <Link
              href={`/organizer/auth?template=${template.slug}`}
              className="rounded-lg bg-[#C5A059] px-4 py-2 font-medium text-white shadow-sm hover:bg-[#b08f4a]"
            >
              Personalizar este modelo
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2 items-start">

          {/* Preview com marca de água */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{ aspectRatio: "2/3" }}>
              <TemplatePreview
                slug={template.slug}
                name={template.name}
                componentName={template.componentName}
                previewUrl={template.previewUrl}
                layoutJson={template.layoutJson}
                demoData={template.demoData}
                className="h-full w-full"
              />
              <Watermark />
            </div>
            <p className="mt-3 text-center text-xs text-gray-400 italic">
              Pré-visualização — a marca de água é removida após pagamento
            </p>
          </div>

          {/* Info + Acções */}
          <div className="flex flex-col gap-6 lg:pt-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-[#C5A059]">
                Modelo de Convite Digital
              </p>
              <h1 className="mt-1 text-3xl font-serif-custom font-bold text-[#1A1A1A]">
                {template.name}
              </h1>
              {template.description && (
                <p className="mt-3 text-gray-600 leading-relaxed">{template.description}</p>
              )}
            </div>

            {/* Preço */}
            <div className="rounded-2xl border border-[#C5A059]/30 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Preço do modelo</p>
              <p className="mt-1 text-3xl font-bold text-[#1A1A1A]">
                {mzn.toLocaleString("pt-PT")} MT
              </p>
              <p className="text-sm text-gray-400">≈ US$ {usd}</p>
            </div>

            {/* O que está incluído */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3">O que está incluído</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "✅ Convite digital personalizado",
                  "✅ RSVP com confirmação de presença",
                  "✅ QR Code individual por convidado",
                  "✅ Partilha por WhatsApp",
                  "✅ Confirmação de entrada (scanner)",
                  "✅ Relatórios em PDF",
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Nota sobre convidados */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <strong>💡 Nota:</strong> Após personalizar o modelo, a lista de convidados é cobrada
              separadamente a <strong>{config.invitationFeeCents / 100} MT por convidado</strong>.
            </div>

            {/* CTA */}
            <Link
              href={`/organizer/auth?template=${template.slug}`}
              className="rounded-2xl bg-[#C5A059] px-6 py-4 text-center text-lg font-bold text-white shadow-md transition hover:bg-[#b08f4a] hover:shadow-lg"
            >
              Personalizar este modelo →
            </Link>

            <Link href="/" className="text-center text-sm text-gray-400 hover:underline">
              Ver outros modelos
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
