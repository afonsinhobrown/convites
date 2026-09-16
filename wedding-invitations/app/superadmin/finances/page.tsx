import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/superadmin-auth";
import { SuperAdminHeader } from "@/components/superadmin/SuperAdminHeader";
import { FinancesView } from "./FinancesView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Facturação & Finanças — SuperAdmin",
};

export default async function FinancesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login?tab=admin");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        include: {
          organizer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      },
    },
  });

  const serializedPayments = payments.map((p) => {
    const meta = (p.metadata as Record<string, unknown> | null) || {};
    const isSandbox = Boolean(meta.isSandbox);
    return {
      id: p.id,
      eventId: p.eventId,
      type: p.type, // TEMPLATE | GUEST_FEE
      amountCents: p.amountCents,
      amountMzn: Math.round(p.amountCents / 100),
      currency: p.currency,
      status: p.status, // PENDING | PAID | FAILED | CANCELLED
      provider: p.provider,
      providerRef: p.providerRef,
      isSandbox,
      confirmedAt: p.confirmedAt ? p.confirmedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      event: p.event
        ? {
            id: p.event.id,
            brideName: p.event.brideName,
            groomName: p.event.groomName,
            weddingDate: p.event.weddingDate.toISOString(),
            templateSlug: p.event.templateSlug,
            organizerName: p.event.organizer?.name || "Desconhecido",
            organizerEmail: p.event.organizer?.email || "-",
            organizerPhone: p.event.organizer?.phone || p.event.rsvpContact || "-",
          }
        : null,
    };
  });

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <SuperAdminHeader adminName={admin.name} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <FinancesView payments={serializedPayments} />
      </div>
    </main>
  );
}
