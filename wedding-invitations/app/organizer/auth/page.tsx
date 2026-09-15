import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata = { title: "Acesso — Convites de Casamento" };

export default function AuthChoicePage({
  searchParams,
}: {
  searchParams: { template?: string };
}) {
  const template = searchParams.template ?? "";
  const qs = template ? `?template=${template}` : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C5A059]/10">
            <Heart className="h-6 w-6 fill-[#C5A059] text-[#C5A059]" />
          </div>
          <h1 className="text-2xl font-serif-custom font-bold text-[#1A1A1A]">
            Convites de Casamento
          </h1>
          {template && (
            <p className="text-sm text-gray-500">
              Escolheste o modelo <span className="font-medium text-[#C5A059]">{template}</span>
            </p>
          )}
          <p className="text-sm text-gray-500">Como queres continuar?</p>
        </div>

        {/* Opções */}
        <div className="flex flex-col gap-4">
          {/* Criar conta */}
          <Link
            href={`/organizer/register${qs}`}
            className="flex flex-col items-center rounded-2xl border-2 border-[#C5A059] bg-[#C5A059] px-6 py-5 text-white shadow-sm transition hover:bg-[#b08f4a] hover:border-[#b08f4a]"
          >
            <span className="text-lg font-semibold">Criar conta</span>
            <span className="mt-0.5 text-sm opacity-80">Sou novo, quero registar-me</span>
          </Link>

          {/* Entrar */}
          <Link
            href={`/organizer/login${qs}`}
            className="flex flex-col items-center rounded-2xl border-2 border-[#C5A059] bg-white px-6 py-5 text-[#C5A059] shadow-sm transition hover:bg-[#C5A059]/5"
          >
            <span className="text-lg font-semibold">Entrar</span>
            <span className="mt-0.5 text-sm text-gray-500">Já tenho conta de organizador</span>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          <Link href="/" className="hover:underline">← Voltar à montra</Link>
        </p>
      </div>
    </main>
  );
}
