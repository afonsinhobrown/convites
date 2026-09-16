import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/superadmin-auth";
import { SuperAdminHeader } from "@/components/superadmin/SuperAdminHeader";
import { AdminsView } from "./AdminsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestão de Administradores — SuperAdmin",
};

export default async function AdminsPage() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) redirect("/login?tab=admin");

  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isMaster: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedAdmins = admins.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <SuperAdminHeader adminName={currentAdmin.name} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AdminsView
          initialAdmins={serializedAdmins}
          currentAdmin={{
            id: currentAdmin.id,
            name: currentAdmin.name,
            email: currentAdmin.email,
            isMaster: currentAdmin.isMaster,
          }}
        />
      </div>
    </main>
  );
}
