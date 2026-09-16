import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganizerId } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(
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
    });

    if (!event) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const dataToUpdate: Record<string, unknown> = {};

    if (body.status === "COMPLETED") {
      dataToUpdate.status = "COMPLETED";
      dataToUpdate.completedAt = new Date();
    } else if (body.status === "ACTIVE") {
      dataToUpdate.status = "ACTIVE";
      dataToUpdate.completedAt = null;
    }

    if (body.securityPin !== undefined) {
      const cleanPin = String(body.securityPin).trim();
      if (cleanPin.length < 4) {
        return NextResponse.json(
          { error: "O PIN de segurança deve ter pelo menos 4 dígitos." },
          { status: 400 }
        );
      }
      dataToUpdate.securityPin = cleanPin;
    }

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      securityPin: updated.securityPin,
      completedAt: updated.completedAt,
    });
  } catch (error) {
    console.error("Erro ao atualizar estado do evento:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
