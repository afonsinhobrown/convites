import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSystemConfig } from "@/lib/config";

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const invitationFeeCents = body.invitationFeeCents;
    const bimExchangeRate = body.bimExchangeRate;
    const netshopEnabled = body.netshopEnabled;
    const templates = body.templates;

    if (!isNonNegativeInt(invitationFeeCents)) {
      return NextResponse.json({ error: "invitationFeeCents deve ser um inteiro >= 0" }, { status: 400 });
    }
    if (!isNonNegativeInt(bimExchangeRate) || bimExchangeRate === 0) {
      return NextResponse.json({ error: "bimExchangeRate deve ser um inteiro > 0" }, { status: 400 });
    }
    if (typeof netshopEnabled !== "boolean") {
      return NextResponse.json({ error: "netshopEnabled deve ser um booleano" }, { status: 400 });
    }
    if (
      !Array.isArray(templates) ||
      templates.some(
        (t) =>
          typeof t?.id !== "string" ||
          !isNonNegativeInt(t?.priceUsdCents)
      )
    ) {
      return NextResponse.json(
        { error: "templates deve ser uma lista com id e priceUsdCents válidos" },
        { status: 400 }
      );
    }

    const existingConfig = await getSystemConfig();

    const config = await prisma.systemConfig.update({
      where: { id: existingConfig.id },
      data: {
        invitationFeeCents,
        bimExchangeRate,
        netshopEnabled,
      },
    });

    await Promise.all(
      templates.map((t) =>
        prisma.invitationTemplate.update({
          where: { id: t.id },
          data: { priceUsdCents: t.priceUsdCents },
        })
      )
    );

    const updatedTemplates = await prisma.invitationTemplate.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      config: {
        invitationFeeCents: config.invitationFeeCents,
        bimExchangeRate: config.bimExchangeRate,
        netshopEnabled: config.netshopEnabled,
      },
      templates: updatedTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        priceUsdCents: t.priceUsdCents,
      })),
    });
  } catch (error) {
    console.error("Erro ao guardar configurações:", error);
    return NextResponse.json({ error: "Erro interno ao guardar configurações" }, { status: 500 });
  }
}