import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/invitation";
import { eventToInvitationData } from "@/lib/invitation";
import { InvitationRenderer } from "@/components/invitations/InvitationRenderer";
import { RsvpForm } from "./RsvpForm";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: { secureToken: string } }) {
  const guest = await prisma.guest.findUnique({
    where: { secureToken: params.secureToken },
    include: { event: true },
  });

  if (!guest) notFound();

  const [template, data] = await Promise.all([
    prisma.invitationTemplate.findUnique({ where: { slug: guest.event.templateSlug } }),
    Promise.resolve(eventToInvitationData(guest.event)),
  ]);
  data.guestName = guest.name;
  const layoutName = template?.componentName ?? guest.event.templateSlug;
  const baseUrl = getBaseUrl();
  const inviteUrl = `${baseUrl}/invite/${guest.secureToken}`;

  let qrDataUrl: string | null = null;
  if (guest.rsvpStatus === "CONFIRMED") {
    qrDataUrl = await QRCode.toDataURL(inviteUrl, { width: 220, margin: 1 });
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <div className="mx-auto max-w-md px-4 py-8">
        <InvitationRenderer
          layout={layoutName}
          data={data}
          layoutJson={template?.layoutJson as never}
          previewUrl={template?.previewUrl}
        />

        <div className="mt-8">
          {guest.rsvpStatus === "PENDING" && (
            <RsvpForm secureToken={guest.secureToken} initialGuestsCount={guest.guestsCount || 1} />
          )}

          {guest.rsvpStatus === "CONFIRMED" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-fit rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4">
                <p className="text-sm font-medium text-emerald-800">
                  A sua presença foi confirmada!
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  {guest.guestsCount} pessoa(s) confirmada(s).
                </p>
              </div>
              {qrDataUrl && (
                <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-sm">
                  <p className="mb-2 text-xs font-medium text-gray-500">Apresente este QR Code na entrada</p>
                  <Image
                    src={qrDataUrl}
                    alt="QR Code do convite"
                    width={220}
                    height={220}
                    unoptimized
                    className="mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          {guest.rsvpStatus === "DECLINED" && (
            <div className="mx-auto w-fit rounded-2xl border border-gray-200 bg-white px-6 py-5 text-center shadow-sm">
              <p className="text-sm font-medium text-gray-700">Lamentamos que não possam estar presentes.</p>
              <p className="mt-1 text-xs text-gray-500">Contamos convosco para outra ocasião!</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#C5A059]"
          >
            <Heart className="h-3 w-3" />
            Criado com Convites de Casamento
          </Link>
        </div>
      </div>
    </main>
  );
}