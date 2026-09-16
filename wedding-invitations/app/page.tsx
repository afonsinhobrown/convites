import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/config";
import { TemplatePreview } from "@/components/invitations/TemplatePreview";
import { Watermark } from "@/components/Watermark";

import { PublicidadeSection } from "@/components/PublicidadeSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Convites de Casamento — DoReMi Eventos",
  description: "Convites digitais personalizados com RSVP, QR Code e confirmação de presença. Escolha o seu modelo.",
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#FDFBF7] text-gray-900">
      {/* Imagem de Fundo Cultural Bem Nítida */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-bottom sm:bg-center bg-no-repeat opacity-85"
        style={{
          backgroundImage: "url('/fundo.png')",
        }}
      />
      {/* Gradiente sutil apenas no topo para contraste perfeito do cabeçalho */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#FDFBF7]/70 via-transparent to-[#FDFBF7]/90" />

      {/* Header com logo DoReMi */}
      <header className="sticky top-0 z-30 border-b border-[#C5A059]/30 bg-white/90 backdrop-blur-md shadow-sm">
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
              href="/login"
              className="rounded-lg px-3.5 py-1.5 font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Entrar
            </Link>
            <Link
              href="/organizer/register"
              className="rounded-lg bg-[#C5A059] px-4 py-1.5 font-semibold text-white shadow-sm hover:bg-[#b08f4a] transition"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C5A059]/15 px-3.5 py-1 text-xs font-semibold text-[#8B5A2B] border border-[#C5A059]/30">
            ✨ Convites Digitais Interativos &amp; Personalizados
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-serif-custom font-bold text-[#1A1A1A] tracking-tight">
            Convites de casamento inesquecíveis
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
            Celebre o amor em todas as suas tradições. Escolha o seu modelo favorito, personalize com
            os dados do casal e partilhe com confirmação RSVP e QR Code.
          </p>
        </div>

        {/* Banner Panorâmico com a Imagem em Alta Definição */}
        <div className="mt-8 overflow-hidden rounded-3xl border-2 border-[#C5A059]/40 bg-white/90 p-2 shadow-2xl backdrop-blur-sm transition hover:border-[#C5A059]">
          <div className="relative aspect-[16/6] w-full overflow-hidden rounded-2xl bg-white">
            <Image
              src="/fundo.png"
              alt="Celebração do Amor e Tradições — DoReMi Eventos"
              fill
              priority
              className="object-contain object-center scale-105 transition-transform duration-700 hover:scale-110"
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-serif-custom font-bold text-gray-900">
            Modelos de Convites Disponíveis
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Selecione um modelo para pré-visualizar e começar a criar
          </p>
        </div>

        <Gallery />

        {/* Espaço de Publicidade & Vídeo DoReMi */}
        <PublicidadeSection />
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-[#C5A059]/20 bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Image
                src="/doremi-logo.jpg"
                alt="DoReMi Eventos"
                width={130}
                height={32}
                className="h-8 w-auto object-contain"
              />
              <p className="text-xs text-gray-500">
                Plataforma de convites digitais exclusivos para casamentos e eventos.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link href="/login?tab=organizer" className="hover:text-[#C5A059] transition">
                Área do Promotor
              </Link>
              <Link href="/login?tab=designer" className="hover:text-[#C5A059] transition">
                Área do Designer
              </Link>
              <Link href="/login?tab=admin" className="hover:text-[#C5A059] transition font-medium text-gray-700">
                SuperAdmin & Finanças
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} DoReMi Eventos. Todos os direitos reservados.
          </div>
        </div>
      </footer>
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
            className="group rounded-2xl border border-[#C5A059]/25 bg-white/95 backdrop-blur-sm p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#C5A059]/60"
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
              <p className="mt-1 text-sm font-medium text-[#C5A059]" suppressHydrationWarning>
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