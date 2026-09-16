import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/config";
import { getCurrentAdmin } from "@/lib/superadmin-auth";
import { SuperAdminHeader } from "@/components/superadmin/SuperAdminHeader";
import { SuperAdminSettingsForm } from "./SuperAdminSettingsForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configurações Globais — SuperAdmin",
};

export default async function SuperAdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login?tab=admin");

  const [systemConfig, templates] = await Promise.all([
    getSystemConfig(),
    prisma.invitationTemplate.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <SuperAdminHeader adminName={admin.name} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SuperAdminSettingsForm
          initialConfig={{
            invitationFeeCents: systemConfig.invitationFeeCents,
            bimExchangeRate: systemConfig.bimExchangeRate,
            netshopEnabled: systemConfig.netshopEnabled,
            sandboxEnabled: systemConfig.sandboxEnabled ?? true,
          }}
          initialTemplates={templates.map((t) => ({
            id: t.id,
            name: t.name,
            priceUsdCents: t.priceUsdCents,
          }))}
        />
      </div>
    </main>
  );
}