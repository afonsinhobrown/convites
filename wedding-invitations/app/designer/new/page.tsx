import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DESIGNER_COOKIE_NAME, verifyDesignerSessionToken } from "@/lib/designer-auth";
import { NewTemplateForm } from "./NewTemplateForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Adicionar Modelo — Designer" };

export default async function NewTemplatePage() {
  const token = cookies().get(DESIGNER_COOKIE_NAME)?.value;
  const designerId = token ? await verifyDesignerSessionToken(token) : null;

  if (!designerId) {
    redirect("/designer/login?from=/designer/new");
  }

  const designer = await prisma.designer.findUnique({ where: { id: designerId } });
  if (!designer || !designer.active) {
    redirect("/designer/login?from=/designer/new");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <NewTemplateForm />
    </main>
  );
}
