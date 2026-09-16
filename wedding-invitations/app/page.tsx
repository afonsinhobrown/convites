import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/config";
import { TemplatePreview } from "@/components/invitations/TemplatePreview";
import { Watermark } from "@/components/Watermark";
import { Palette } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Convites de Casamento — DoReMi Eventos",
  description: "Convites digitais personalizados com RSVP, QR Code e confirmação de presença. Escolha o seu modelo.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Header com logo DoReMi */}
      <header className="border-b border-[#C5A059]/30 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/doremi-logo.jpg"
              alt="DoReMi Eventos"
              width={140}
              height={35}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/designer/login"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="Acesso do designer"
            >
              <Palette className="h-4 w-4" />
              Designer
            </Link>
            <Link
              href="/organizer/login"
              className="rounded-lg px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100"
            >
              Entrar
            </Link>
            <Link
              href="/organizer/register"
              className="rounded-lg bg-[#C5A059] px-3 py-1.5 font-medium text-white shadow-sm hover:bg-[#b08f4a]"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-serif-custom font-bold text-[#1A1A1A]">
            Convites de casamento inesquecíveis
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Escolha um dos nossos modelos, personalize e partilhe o convite digital com os seus
            convidados. Com RSVP e confirmação por QR Code.
          </p>
        </div>

        <Gallery />
      </section>
    </main>
  );
}

async function Gallery() {
  const [templates, config] = await Promise.all([
    prisma.invitationTemplate.findMany({
      where: { status: "PUBLISHED", active: true },
      orderBy: { sortOrder: "asc" },
    }),
    getSystemConfig(),
  ]);

  return (
    <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {templates.map((t) => {
        const mzn = Math.round((t.priceUsdCents / 100) * config.bimExchangeRate);
        return (
          <Link
            key={t.id}
            href={`/templates/${t.slug}`}
            className="group rounded-2xl border border-[#C5A059]/20 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            {/* Preview com marca de água */}
            <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "2/3" }}>
              <TemplatePreview
                slug={t.slug}
                name={t.name}
                componentName={t.componentName}
                previewUrl={t.previewUrl}
                layoutJson={t.layoutJson}
                demoData={t.demoData}
                className="h-full w-full"
              />
              <Watermark />
            </div>

            <div className="mt-3">
              <h2 className="text-sm font-semibold text-gray-900">{t.name}</h2>
              <p className="mt-1 text-sm font-medium text-[#C5A059]">
                {mzn.toLocaleString("pt-PT")} MT
              </p>
              <p className="mt-1 text-xs font-medium text-gray-400 group-hover:text-[#C5A059] transition">
                Ver modelo →
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}