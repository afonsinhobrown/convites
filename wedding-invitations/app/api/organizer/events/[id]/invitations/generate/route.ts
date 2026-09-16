import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";
import { getBaseUrl } from "@/lib/invitation";
import { buildRenderUrl } from "@/lib/render-token";
import { screenshotUrls } from "@/lib/puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeName(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "convite"
  );
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const organizerId = await getCurrentOrganizerId();
    if (!organizerId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const eventId = params.id;
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    if (!event.templatePaidAt) {
      return NextResponse.json({ error: "Evento aguarda pagamento" }, { status: 402 });
    }

    const body = await request.json().catch(() => ({}));
    const mode = body?.mode;
    if (mode !== "for_print" && mode !== "for_guest") {
      return NextResponse.json({ error: "Modo inválido (use for_print ou for_guest)" }, { status: 400 });
    }

    const baseUrl = getBaseUrl();
    const couple = `${sanitizeName(event.brideName)}-${sanitizeName(event.groomName)}`;

    if (mode === "for_print") {
      const buffer = await screenshotUrls([
        { name: "convite", url: buildRenderUrl(baseUrl, eventId, "for_print") },
      ]);
      const png = buffer[0].buffer;

      return new NextResponse(new Uint8Array(png), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="convite-${couple}.png"`,
        },
      });
    }

    // mode === "for_guest"
    const guests = await prisma.guest.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
    if (guests.length === 0) {
      return NextResponse.json({ error: "Não há convidados para gerar convites" }, { status: 400 });
    }

    const images = await screenshotUrls(
      guests.map((g) => ({
        name: sanitizeName(g.name),
        url: buildRenderUrl(baseUrl, eventId, "for_guest", g.name),
      }))
    );

    const zip = new AdmZip();
    for (const img of images) {
      zip.addFile(`${img.name}.png`, img.buffer);
    }
    const zipBuffer = zip.toBuffer();

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="convites-${couple}.zip"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar convites PNG:", error);
    return NextResponse.json({ error: "Erro interno ao gerar convites" }, { status: 500 });
  }
}