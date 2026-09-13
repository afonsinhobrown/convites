import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DesignerEditor } from "./DesignerEditor";

export const dynamic = "force-dynamic";

export default async function DesignerEditorPage({ params }: { params: { templateId: string } }) {
  const template = await prisma.invitationTemplate.findUnique({
    where: { slug: params.templateId },
  });

  if (!template) notFound();

  return <DesignerEditor template={template} />;
}