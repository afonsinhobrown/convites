import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/config";
import { TemplatePreview } from "@/components/invitations/TemplatePreview";
import { Watermark } from "@/components/Watermark";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Convites de Casamento — DoReMi Eventos",
  description: "Convites digitais personalizados com RSVP, QR Code e confirmação de presença. Escolha o seu modelo.",
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#FDFBF7] text-gray-900">
      {/* Imagem de Fundo Cultural de Casamentos com Transparência */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-bottom sm:bg-center bg-no-repeat opacity-50"
        style={{
          backgroundImage: "url('/fundo.png')",
        }}
      />
      {/* Camada de suavização e realce dourado */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-white/70 via-[#FDFBF7]/50 to-[#FDFBF7]/85" />

      {/* Header com logo DoReMi */}
      <header className="sticky top-0 z-30 border-b border-[#C5A059]/25 bg-white/90 backdrop-blur-md shadow-sm">
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
              className="rounded-lg px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100/80 transition"
            >
              Entrar
            </Link>
            <Link
              href="/organizer/register"
              className="rounded-lg bg-[#C5A059] px-3.5 py-1.5 font-medium text-white shadow-sm hover:bg-[#b08f4a] transition"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-serif-custom font-bold text-[#1A1A1A] tracking-tight">
            Convites de casamento inesquecíveis
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
            Escolha um dos nossos modelos, personalize e partilhe o convite digital com os seus
            convidados. Com RSVP e confirmação por QR Code.
          </p>
        </div>

        <Gallery />
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