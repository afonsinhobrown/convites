"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DollarSign, Settings, Users, LogOut, Shield } from "lucide-react";

export function SuperAdminHeader({ adminName = "SuperAdmin" }: { adminName?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/superadmin/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const tabs = [
    {
      href: "/superadmin/finances",
      label: "Facturação & Finanças",
      icon: DollarSign,
      active: pathname.startsWith("/superadmin/finances"),
    },
    {
      href: "/superadmin/settings",
      label: "Configurações Globais",
      icon: Settings,
      active: pathname.startsWith("/superadmin/settings"),
    },
    {
      href: "/superadmin/admins",
      label: "Gestão de Administradores",
      icon: Users,
      active: pathname.startsWith("/superadmin/admins"),
    },
  ];

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/superadmin/finances" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm font-bold">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <span className="text-base font-bold text-gray-900 block leading-tight">
                DoReMi SuperAdmin
              </span>
              <span className="text-[11px] text-gray-500 block leading-tight">
                Painel Central de Controlo
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  tab.active
                    ? "bg-white text-amber-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-medium hidden sm:inline-block">
            {adminName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
            title="Terminar sessão"
          >
            <LogOut className="h-3.5 w-3.5 text-gray-500" />
            Sair
          </button>
        </div>
      </div>

      {/* Tabs Mobile */}
      <div className="flex md:hidden border-t border-gray-100 px-4 py-2 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                tab.active ? "bg-amber-100 text-amber-900" : "text-gray-600"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
