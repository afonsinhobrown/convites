import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar — Organizador" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-serif-custom font-bold text-[#1A1A1A]">Entrar</h1>
          <p className="mt-1 text-sm text-gray-500">Acesso ao painel do organizador</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-center text-sm text-gray-600">
          Ainda não tem conta?{" "}
          <Link
            href="/organizer/register"
            className="font-medium text-[#C5A059] hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}