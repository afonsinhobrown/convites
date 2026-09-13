import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/config";
import { SuperAdminSettingsForm } from "./SuperAdminSettingsForm";

export const dynamic = "force-dynamic";

export default async function SuperAdminSettingsPage() {
  const [systemConfig, templates] = await Promise.all([
    getSystemConfig(),
    prisma.invitationTemplate.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <SuperAdminSettingsForm
      initialConfig={{
        invitationFeeCents: systemConfig.invitationFeeCents,
        bimExchangeRate: systemConfig.bimExchangeRate,
        netshopEnabled: systemConfig.netshopEnabled,
      }}
      initialTemplates={templates.map((t) => ({
        id: t.id,
        name: t.name,
        priceUsdCents: t.priceUsdCents,
      }))}
    />
  );
}