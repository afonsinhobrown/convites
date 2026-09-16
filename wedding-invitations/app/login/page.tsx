import { Suspense } from "react";
import { UnifiedLoginForm } from "./UnifiedLoginForm";

export const metadata = {
  title: "Entrar — DoReMi Eventos",
  description: "Acesse a sua conta de Promotor, Designer ou Administração.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7]" />}>
      <UnifiedLoginForm />
    </Suspense>
  );
}
