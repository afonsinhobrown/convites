"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Palette, Shield, ArrowLeft, Loader2, Lock, Mail } from "lucide-react";

type LoginTab = "promoter" | "designer" | "admin";

export function UnifiedLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as LoginTab) || "promoter";
  const [tab, setTab] = useState<LoginTab>(initialTab);

  // Campos de Formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tab === "promoter") {
        const res = await fetch("/api/organizer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Email ou password incorretos");
        router.push("/organizer");
        router.refresh();
      } else if (tab === "designer") {
        const res = await fetch("/api/designer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Email ou password incorretos");
        router.push("/designer");
        router.refresh();
      } else if (tab === "admin") {
        const res = await fetch("/api/superadmin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email || undefined, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Credenciais de administrador incorretas");
        router.push("/superadmin/finances");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao efetuar login");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Botão Voltar */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar à página inicial
          </Link>
        </div>

        {/* Logo DoReMi */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/doremi-logo.jpg"
              alt="DoReMi Eventos"
              width={140}
              height={38}
              className="h-10 w-auto object-contain mx-auto"
              priority
            />
          </Link>
          <h1 className="mt-3 text-2xl font-serif-custom font-bold text-gray-900">
            Portal de Acesso
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Selecione o seu perfil para aceder à sua área
          </p>
        </div>

        {/* Card Principal de Login */}
        <div className="mt-6 rounded-3xl border border-[#C5A059]/30 bg-white p-6 sm:p-8 shadow-xl">
          {/* Seletor de Abas */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1.5 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab("promoter");
                setError(null);
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 text-center transition ${
                tab === "promoter"
                  ? "bg-white text-gray-900 font-bold shadow-sm"
                  : "text-gray-500 hover:text-gray-900 text-xs font-medium"
              }`}
            >
              <Heart className={`h-4 w-4 ${tab === "promoter" ? "text-amber-600" : "text-gray-400"}`} />
              <span className="text-[11px] sm:text-xs">Promotor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("designer");
                setError(null);
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 text-center transition ${
                tab === "designer"
                  ? "bg-white text-gray-900 font-bold shadow-sm"
                  : "text-gray-500 hover:text-gray-900 text-xs font-medium"
              }`}
            >
              <Palette className={`h-4 w-4 ${tab === "designer" ? "text-rose-600" : "text-gray-400"}`} />
              <span className="text-[11px] sm:text-xs">Designer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("admin");
                setError(null);
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 text-center transition ${
                tab === "admin"
                  ? "bg-white text-gray-900 font-bold shadow-sm"
                  : "text-gray-500 hover:text-gray-900 text-xs font-medium"
              }`}
            >
              <Shield className={`h-4 w-4 ${tab === "admin" ? "text-amber-700" : "text-gray-400"}`} />
              <span className="text-[11px] sm:text-xs">Admin</span>
            </button>
          </div>

          {/* Descrição do Perfil Ativo */}
          <div className="mb-4 text-center">
            {tab === "promoter" && (
              <p className="text-xs text-gray-500">
                Acesso para clientes, noivos e promotores de casamentos.
              </p>
            )}
            {tab === "designer" && (
              <p className="text-xs text-gray-500">
                Acesso exclusivo para designers criarem e publicarem modelos.
              </p>
            )}
            {tab === "admin" && (
              <p className="text-xs text-gray-500">
                Acesso à gestão financeira, taxas e administração geral.
              </p>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo Email (opcional se for SuperAdmin com Master Password) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tab === "admin" ? "Email (ou deixe em branco se usar Chave Master)" : "Email"}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required={tab !== "admin"}
                  autoFocus={tab !== "admin"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    tab === "admin"
                      ? "admin@doremi.local (opcional)"
                      : tab === "designer"
                      ? "designer@doremi.local"
                      : "seu-email@exemplo.com"
                  }
                  className="block w-full rounded-xl border border-gray-300 pl-9 pr-3.5 py-2.5 text-xs text-gray-900 focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tab === "admin" ? "Password de Administrador ou Chave Master" : "Password"}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  autoFocus={tab === "admin"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-gray-300 pl-9 pr-3.5 py-2.5 text-xs text-gray-900 focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-md transition disabled:opacity-50 ${
                tab === "promoter"
                  ? "bg-[#C5A059] hover:bg-[#b08f4a]"
                  : tab === "designer"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A entrar...
                </>
              ) : (
                `Entrar como ${tab === "promoter" ? "Promotor" : tab === "designer" ? "Designer" : "Administrador"} →`
              )}
            </button>
          </form>

          {/* Links Auxiliares no Rodapé do Card */}
          {tab === "promoter" && (
            <div className="mt-6 border-t border-gray-100 pt-4 text-center">
              <p className="text-xs text-gray-500">
                Ainda não tem conta?{" "}
                <Link
                  href="/organizer/register"
                  className="font-bold text-[#C5A059] hover:underline"
                >
                  Registe-se gratuitamente
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
