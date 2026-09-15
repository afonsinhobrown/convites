import { InvitationRenderer } from "@/components/invitations/InvitationRenderer";
import type { InvitationMode } from "@/components/invitations/types";
import { TemplateThumbnail } from "@/components/templates/TemplateThumbnail";
import { demoDataToInvitationData } from "@/lib/demo-data";
import type { LayoutJson } from "@/lib/designer-layout";

// Preview de um template na montra/selector. Usa os dados fictícios
// (demoData) quando existem; caso contrário cai no thumbnail estático.
export function TemplatePreview({
  slug,
  name,
  componentName,
  previewUrl,
  layoutJson,
  demoData,
  mode = "preview",
  className = "aspect-[2/3]",
}: {
  slug: string;
  name: string;
  componentName: string;
  previewUrl?: string | null;
  layoutJson?: unknown;
  demoData?: unknown;
  mode?: InvitationMode;
  className?: string;
}) {
  const data = demoDataToInvitationData(demoData);

  if (!data) {
    return (
      <TemplateThumbnail slug={slug} name={name} previewUrl={previewUrl} className={className} />
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <InvitationRenderer
        layout={componentName || slug}
        data={data}
        layoutJson={layoutJson as LayoutJson | null}
        previewUrl={previewUrl}
        mode={mode}
      />
    </div>
  );
}