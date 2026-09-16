import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { formatEventDate, getBaseUrl, eventToInvitationData } from "@/lib/invitation";
import { getSystemConfig } from "@/lib/config";
import { ArrowLeft } from "lucide-react";
import { TemplatePreview } from "@/components/invitations/TemplatePreview";
import { GuestForm } from "./GuestForm";
import { CouplePhotos } from "./CouplePhotos";
import { InvitesPanel, type InviteGuest } from "./InvitesPanel";
import { EventDetailsEditor } from "./EventDetailsEditor";
import { EventPendingPayment } from "./EventPendingPayment";
import { ReportsSection } from "./ReportsSection";
import { EventStatusAndScanner } from "./EventStatusAndScanner";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const organizerId = await getCurrentOrganizerId();
  if (!organizerId) redirect("/organizer/login");

    const [event, publishedTemplates, guests, config, messagesCount, giftsCount, whatsAppLogsCount] =
      await Promise.all([
        prisma.event.findFirst({ where: { id: params.id, organizerId } }),
        prisma.invitationTemplate.findMany({
          where: { status: "PUBLISHED", active: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.guest.findMany({
          where: { eventId: params.id },
          orderBy: { createdAt: "asc" },
        }),
        getSystemConfig(),
        prisma.message.count({ where: { eventId: params.id } }),
        prisma.gift.count({ where: { eventId: params.id } }),
        prisma.whatsAppLog.count({ where: { eventId: params.id } }),
      ]);

    if (!event) notFound();

    const templates = [...publishedTemplates];
    let currentTemplate = templates.find((t) => t.slug === event.templateSlug);
    if (!currentTemplate && event.templateSlug) {
      const fallbackTpl = await prisma.invitationTemplate.findUnique({
        where: { slug: event.templateSlug },
      });
      if (fallbackTpl) {
        currentTemplate = fallbackTpl;
        templates.unshift(fallbackTpl);
      }
    }

    const { day, month, year } = formatEventDate(event.weddingDate);

  // SE O EVENTO NÃO ESTÁ PAGO: Bloqueia a tela e exibe o checkout do template NetShop
  if (!event.templatePaidAt) {
    const priceMzn = Math.round(((currentTemplate?.priceUsdCents ?? 0) / 100) * config.bimExchangeRate);
    return (
      <EventPendingPayment
        event={{
          id: event.id,
          brideName: event.brideName,
          groomName: event.groomName,
          ceremonyVenue: event.ceremonyVenue,
          ceremonyTime: event.ceremonyTime,
          weddingDateFormatted: `${day} de ${month.toLowerCase()} de ${year}`,
          templateSlug: event.templateSlug,
          rsvpContact: event.rsvpContact,
        }}
        template={{
          name: currentTemplate?.name ?? "Modelo de Convite",
          previewUrl: currentTemplate?.previewUrl ?? null,
          priceMzn,
        }}
        sandboxAllowed={config.sandboxEnabled ?? true}
      />
    );
  }

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
              templateLayoutJson={currentTemplate?.layoutJson}
              templateSlug={currentTemplate?.slug}
              initialData={{
                brideName: event.brideName,
                groomName: event.groomName,
                weddingDateRaw,
                ceremonyTime: event.ceremonyTime,
                ceremonyVenue: event.ceremonyVenue,
                ceremonyAddress: event.ceremonyAddress,
                rsvpContact: event.rsvpContact,
                welcomeMessage: event.welcomeMessage ?? "",
                invitationHeader: event.invitationHeader ?? "Com a Bênção de Deus",
                invitationIntro: event.invitationIntro ?? "Temos a alegria de vos convidar para o nosso casamento",
                invitationRomantic: event.invitationRomantic ?? "Duas vidas, dois corações, uma história para toda a vida.",
                invitationHonor: event.invitationHonor ?? "Será uma honra celebrar este momento tão especial na presença de vocês.",
                invitationFooter: event.invitationFooter ?? "Juntos para sempre",
                invitationValues: event.invitationValues ?? "Amor · Respeito · Companheirismo · Sempre",
              }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        {/* O seu Convite Pago e Personalizado */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              O seu convite ({currentTemplate?.name ?? "Modelo Pago"})
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              ✓ Modelo Pago &amp; Ativo
            </span>
          </div>

          <div className="max-w-[280px] rounded-2xl border-2 border-[#C5A059] bg-white p-3 shadow-md">
            {currentTemplate && (
              <TemplatePreview
                slug={currentTemplate.slug}
                name={currentTemplate.name}
                componentName={currentTemplate.componentName}
                previewUrl={currentTemplate.previewUrl}
                layoutJson={currentTemplate.layoutJson}
                demoData={currentTemplate.demoData}
                customData={eventData}
                className="aspect-[2/3]"
              />
            )}
            <p className="mt-2 text-center text-xs font-medium text-gray-700">
              {currentTemplate?.name}
            </p>
          </div>
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
            <GuestForm
              eventId={event.id}
              isSandbox={event.isSandbox}
              currentCount={guests.length}
            />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Convites</h2>
            <InvitesPanel
              eventId={event.id}
              initialGuests={inviteGuests}
              eventData={eventData}
              guestFeePaid={!!event.guestFeePaidAt}
              guestFeeCents={event.guestFeeCents || 2500}
              sandboxAllowed={config.sandboxEnabled ?? true}
              isSandbox={event.isSandbox}
              template={{
                layout: currentTemplate?.componentName ?? event.templateSlug,
                layoutJson: currentTemplate?.layoutJson ?? null,
                previewUrl: currentTemplate?.previewUrl ?? null,
              }}
            />
          </div>
        </section>

        {/* Portaria e Conclusão do Evento */}
        <section>
          <EventStatusAndScanner
            eventId={event.id}
            initialStatus={event.status || "ACTIVE"}
            initialSecurityPin={event.securityPin || "1234"}
            completedAt={event.completedAt ? event.completedAt.toISOString() : null}
          />
        </section>

        {/* Relatórios Oficiais em PDF */}
        <section>
          <ReportsSection
            eventId={event.id}
            counts={{
              guests: guests.length,
              confirmed: guests.filter((g) => g.rsvpStatus === "CONFIRMED").length,
              messages: messagesCount,
              gifts: giftsCount,
              whatsAppLogs: whatsAppLogsCount,
            }}
          />
        </section>
      </div>
    </main>
  );
}