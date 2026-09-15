import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { eventToInvitationData } from "@/lib/invitation";
import { verifyRenderToken } from "@/lib/render-token";
import { InvitationRenderer } from "@/components/invitations/InvitationRenderer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Página interna de renderização usada pelo puppeteer (server-side) para gerar
// os PNG de convites. Só é acessível com um token assinado (RENDER_TOKEN_SECRET).
export default async function RenderPage({
  searchParams,
}: {
  searchParams: { eventId?: string; mode?: string; guestName?: string; tok?: string };
}) {
  const eventId = searchParams.eventId;
  const mode = searchParams.mode === "for_guest" ? "for_guest" : "for_print";
  const guestName = searchParams.guestName || undefined;

  if (!eventId) notFound();

  const payload = `${eventId}:${mode}:${guestName ?? ""}`;
  if (!verifyRenderToken(payload, searchParams.tok ?? null)) notFound();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  const data = eventToInvitationData(event);
  if (mode === "for_guest") data.guestName = guestName;

  const template = await prisma.invitationTemplate.findUnique({
    where: { slug: event.templateSlug },
  });

  const layoutName = template?.componentName ?? event.templateSlug;

  return (
    <div
      style={{ width: 1024, height: 1536, background: "#fff", overflow: "hidden" }}
    >
      <InvitationRenderer
        layout={layoutName}
        data={data}
        layoutJson={(template?.layoutJson as never) ?? null}
        previewUrl={template?.previewUrl}
        mode={mode}
      />
    </div>
  );
}