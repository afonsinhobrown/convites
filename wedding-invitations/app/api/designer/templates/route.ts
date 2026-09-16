import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { DESIGNER_COOKIE_NAME, verifyDesignerSessionToken } from "@/lib/designer-auth";
import { DEMO_DATA } from "@/lib/demo-data";
import { uploadImageBufferToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

async function getDesigner() {
  const token = cookies().get(DESIGNER_COOKIE_NAME)?.value;
  const designerId = token ? await verifyDesignerSessionToken(token) : null;
  if (!designerId) return null;
  const designer = await prisma.designer.findUnique({ where: { id: designerId } });
  if (!designer || !designer.active) return null;
  return designer;
}

export async function POST(request: Request) {
  try {
    const designer = await getDesigner();
    if (!designer) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = String(formData.get("name") || "").trim();
    const slugRaw = String(formData.get("slug") || "").trim().toLowerCase();
    const priceUsdStr = String(formData.get("priceUsd") || formData.get("price") || "").trim();

    // 1. Validação de Nome
    if (!name) {
      return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
    }

    // 2. Validação e Formatação do Slug
    const slug = slugRaw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
    }

    const existing = await prisma.invitationTemplate.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug já existe" }, { status: 400 });
    }

    // 3. Validação do Preço
    const priceUsd = parseFloat(priceUsdStr);
    if (isNaN(priceUsd) || priceUsd <= 0) {
      return NextResponse.json({ error: "Preço inválido" }, { status: 400 });
    }
    const priceUsdCents = Math.round(priceUsd * 100);

    // 4. Validação da Imagem
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Imagem obrigatória" }, { status: 400 });
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: "Imagem demasiado grande (máximo 5MB)" }, { status: 400 });
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: "Formato inválido. Apenas PNG, JPG ou WEBP são suportados." }, { status: 400 });
    }

    // 5. Upload para Cloudinary CDN (com fallback para Data URI e disco local)
    const mimeType = file.type || "image/png";
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Data = fileBuffer.toString("base64");
    let previewUrl = `data:${mimeType};base64,${base64Data}`;

    try {
      const uploadRes = await uploadImageBufferToCloudinary(fileBuffer, "templates", slug);
      if (uploadRes?.secure_url) {
        previewUrl = uploadRes.secure_url;
      }
    } catch (cdnErr) {
      console.warn("Cloudinary CDN fallback:", cdnErr);
    }

    // Tenta guardar no disco local se o sistema de ficheiros for gravável (ex: desenvolvimento)
    try {
      const templatesDir = path.join(process.cwd(), "public", "templates", slug);
      await fs.mkdir(templatesDir, { recursive: true });
      const isJpg = mimeType.includes("jpeg") || mimeType.includes("jpg");
      const isWebp = mimeType.includes("webp");
      const filename = isJpg ? "fundo.jpg" : isWebp ? "fundo.webp" : "fundo.png";
      const filePath = path.join(templatesDir, filename);
      await fs.writeFile(filePath, fileBuffer);
    } catch {
      // Em Vercel Serverless (/var/task é read-only), o URL Cloudinary ou Data URI assegura 100% de persistência
    }

    // 6. Gerar componentName em PascalCase
    const componentName =
      slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("") + "Layout";

    // 7. Obter próximo sortOrder
    const maxOrder = await prisma.invitationTemplate.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder || 0) + 1;

    // 8. Criar Registo na Base de Dados
    const template = await prisma.invitationTemplate.create({
      data: {
        slug,
        name,
        priceUsdCents,
        previewUrl,
        status: "DRAFT",
        componentName,
        layoutJson: {},
        demoData: JSON.parse(JSON.stringify(DEMO_DATA)),
        sortOrder,
        active: true,
        editedById: designer.id,
      },
    });

    return NextResponse.json({
      ok: true,
      slug: template.slug,
      message: "Modelo criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar novo modelo de convite:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno ao criar modelo" },
      { status: 500 }
    );
  }
}
