import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";

export const runtime = "nodejs";

const ALLOWED_PHOTO_FIELDS = ["photoLeft", "photoRight"] as const;

function isPng(buf: Buffer): boolean {
  return buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
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

    const event = await prisma.event.findFirst({
      where: { id: params.id, organizerId },
      select: { id: true, templatePaidAt: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    if (!event.templatePaidAt) {
      return NextResponse.json({ error: "Evento aguarda pagamento" }, { status: 402 });
    }

    const formData = await request.formData();
    const updates: Record<string, string> = {};
    let uploaded = 0;

    for (const field of ALLOWED_PHOTO_FIELDS) {
      const file = formData.get(field);
      if (!(file instanceof File) || file.size === 0) continue;

      const name = `${field}${path.extname(file.name).toLowerCase() || ".png"}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      if (!isPng(bytes)) {
        return NextResponse.json(
          { error: `O ficheiro de ${field} deve ser um PNG válido` },
          { status: 400 }
        );
      }

      const dir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "events",
        params.id
      );
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, name), bytes);

      updates[field] = `/uploads/events/${params.id}/${name}`;
      uploaded++;
    }

    if (uploaded > 0) {
      await prisma.event.update({
        where: { id: event.id },
        data: updates,
      });
    }

    return NextResponse.json({
      ok: true,
      uploaded,
      ...updates,
    });
  } catch (error) {
    console.error("Erro no upload das fotos:", error);
    return NextResponse.json({ error: "Erro interno no upload" }, { status: 500 });
  }
}
