import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/config";
import { TemplateThumbnail } from "@/components/templates/TemplateThumbnail";
import { Heart, Palette } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="border-b border-[#C5A059]/30 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-[#C5A059] text-[#C5A059]" />
            <span className="text-lg font-serif-custom font-bold text-[#1A1A1A]">
              Convites de Casamento
            </span>
          </div>
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
    prisma.invitationTemplate.findMany({ orderBy: { sortOrder: "asc" } }),
    getSystemConfig(),
  ]);

  return (
    <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {templates.map((t) => {
        const usd = (t.priceUsdCents / 100).toFixed(2);
        const mzn = Math.round((t.priceUsdCents / 100) * config.bimExchangeRate);
        return (
          <Link
            key={t.id}
            href="/organizer/register"
            className="group rounded-2xl border border-[#C5A059]/20 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <TemplateThumbnail slug={t.slug} name={t.name} previewUrl={t.previewUrl} className="aspect-[2/3]" />
            <div className="mt-3">
              <h2 className="text-sm font-semibold text-gray-900">{t.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                US$ {usd} · ≈ {mzn} MT
              </p>
              <p className="mt-1 text-xs font-medium text-[#C5A059] group-hover:underline">
                Começar convite →
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}