import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { formatEventDate, getBaseUrl, eventToInvitationData } from "@/lib/invitation";
import { ArrowLeft } from "lucide-react";
import { TemplatePicker } from "./TemplatePicker";
import { GuestForm } from "./GuestForm";
import { CouplePhotos } from "./CouplePhotos";
import { InvitesPanel, type InviteGuest } from "./InvitesPanel";
import { EventDetailsEditor } from "./EventDetailsEditor";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const organizerId = await getCurrentOrganizerId();
  if (!organizerId) redirect("/organizer/login");

  const [event, templates, guests] = await Promise.all([
    prisma.event.findFirst({ where: { id: params.id, organizerId } }),
    prisma.invitationTemplate.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.guest.findMany({
      where: { eventId: params.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!event) notFound();

  const { day, month, year } = formatEventDate(event.weddingDate);

  // Formato YYYY-MM-DD para o input type="date"
  const d = new Date(event.weddingDate);
  const weddingDateRaw = d.toISOString().split("T")[0];

  const baseUrl = getBaseUrl();
  const inviteGuests: InviteGuest[] = guests.map((g) => ({
    id: g.id,
    name: g.name,
    phone: g.phone,
    email: g.email,
    rsvpStatus: g.rsvpStatus,
    guestsCount: g.guestsCount,
    maxCompanions: g.maxCompanions,
    secureToken: g.secureToken,
    inviteUrl: g.secureToken ? `${baseUrl}/invite/${g.secureToken}` : null,
  }));

  const currentTemplate = templates.find((t) => t.slug === event.templateSlug);
  const eventData = eventToInvitationData(event);

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <header className="border-b border-[#C5A059]/30 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <Link
              href="/organizer"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao painel
            </Link>
            <h1 className="mt-1 text-xl font-serif-custom font-bold text-[#1A1A1A]">
              {event.brideName} &amp; {event.groomName}
            </h1>
            <p className="text-sm text-gray-500">
              {day} de {month.toLowerCase()} de {year} · {event.ceremonyTime} · {event.ceremonyVenue}
            </p>
          </div>
          <div>
            <EventDetailsEditor
              eventId={event.id}
              initialData={{
                brideName: event.brideName,
                groomName: event.groomName,
                weddingDateRaw,
                ceremonyTime: event.ceremonyTime,
                ceremonyVenue: event.ceremonyVenue,
                ceremonyAddress: event.ceremonyAddress,
                rsvpContact: event.rsvpContact,
                welcomeMessage: event.welcomeMessage ?? "",
              }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Escolher modelo</h2>
          <TemplatePicker eventId={event.id} currentSlug={event.templateSlug} templates={templates} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Fotos do casal</h2>
          <CouplePhotos
            eventId={event.id}
            bridesName={event.brideName}
            groomsName={event.groomName}
            initialLeft={event.photoLeft ?? null}
            initialRight={event.photoRight ?? null}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Adicionar convidados</h2>
            <GuestForm eventId={event.id} />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Convites</h2>
            <InvitesPanel
              eventId={event.id}
              initialGuests={inviteGuests}
              eventData={eventData}
              template={{
                layout: currentTemplate?.componentName ?? event.templateSlug,
                layoutJson: currentTemplate?.layoutJson ?? null,
                previewUrl: currentTemplate?.previewUrl ?? null,
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
}