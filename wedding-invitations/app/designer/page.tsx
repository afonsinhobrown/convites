import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DESIGNER_COOKIE_NAME, verifyDesignerSessionToken } from "@/lib/designer-auth";
import { DesignerDashboard } from "./DesignerDashboard";

export const dynamic = "force-dynamic";

export default async function DesignerPage() {
  const token = cookies().get(DESIGNER_COOKIE_NAME)?.value;
  const designerId = token ? await verifyDesignerSessionToken(token) : null;

  if (!designerId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-gray-600">Sessão expirada ou inválida.</p>
          <Link
            href="/designer/login"
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Fazer login
          </Link>
        </div>
      </main>
    );
  }

  const designer = await prisma.designer.findUnique({ where: { id: designerId } });
  if (!designer || !designer.active) notFound();

  const templates = await prisma.invitationTemplate.findMany({
    orderBy: { createdAt: "asc" },
  });

  return <DesignerDashboard designer={designer} templates={templates} />;
}
