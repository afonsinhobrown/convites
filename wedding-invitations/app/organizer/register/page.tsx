import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Criar conta — Organizador" };

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-serif-custom font-bold text-[#1A1A1A]">Criar conta</h1>
          <p className="mt-1 text-sm text-gray-500">Comece a criar o seu convite de casamento</p>
        </div>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta?{" "}
          <Link href="/organizer/login" className="font-medium text-[#C5A059] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}