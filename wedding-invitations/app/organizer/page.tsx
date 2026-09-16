import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { formatEventDate } from "@/lib/invitation";
import { CreateEventForm } from "./CreateEventForm";
import { LogoutButton } from "./LogoutButton";
import { ChangePasswordModal } from "./ChangePasswordModal";

export const dynamic = "force-dynamic";

export default async function OrganizerPanel() {
  const organizerId = await getCurrentOrganizerId();
  if (!organizerId) redirect("/organizer/login");

  const [organizer, events] = await Promise.all([
    prisma.organizer.findUnique({ where: { id: organizerId } }),
    prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: "desc" },
      include: { guests: { select: { id: true } } },
    }),
  ]);

  if (!organizer) redirect("/organizer/login");

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="border-b border-[#C5A059]/30 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-serif-custom font-bold text-[#1A1A1A]">Meu painel</h1>
            <p className="text-sm text-gray-500">Olá, {organizer.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <ChangePasswordModal />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Meus eventos</h2>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Ainda não tem eventos. Crie o primeiro abaixo.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-200 rounded-2xl border border-[#C5A059]/20 bg-white shadow-sm">
              {events.map((event) => {
                const { day, month, year } = formatEventDate(event.weddingDate);
                return (
                  <li key={event.id}>
                    <Link
                      href={`/organizer/events/${event.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.brideName} &amp; {event.groomName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {day} de {month.toLowerCase()} de {year} · {event.ceremonyVenue}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[#C5A059]/10 px-2.5 py-1 text-xs font-medium text-[#8B5A2B]">
                          {event.guests.length} convidado{event.guests.length === 1 ? "" : "s"}
                        </span>
                        <span className="text-sm font-medium text-[#C5A059]">Editar →</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">Criar novo evento</h2>
          <div className="mt-3">
            <CreateEventForm />
          </div>
        </section>
      </div>
    </main>
  );
}