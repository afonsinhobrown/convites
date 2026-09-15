import { Suspense } from "react";
import { DesignerLoginForm } from "./LoginForm";

export const metadata = {
  title: "Login — Designer",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <DesignerLoginForm />
    </Suspense>
  );
}