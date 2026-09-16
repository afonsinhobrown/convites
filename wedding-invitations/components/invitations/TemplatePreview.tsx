import { InvitationRenderer } from "@/components/invitations/InvitationRenderer";
import type { InvitationData, InvitationMode } from "@/components/invitations/types";
import { TemplateThumbnail } from "@/components/templates/TemplateThumbnail";
import { demoDataToInvitationData } from "@/lib/demo-data";
import type { LayoutJson } from "@/lib/designer-layout";

// Preview de um template na montra/selector. Usa os dados reais do evento quando
// fornecidos (customData), senão dados fictícios (demoData), e em fallback thumbnail.
export function TemplatePreview({
  slug,
  name,
  componentName,
  previewUrl,
  layoutJson,
  demoData,
  customData,
  mode = "preview",
  className = "aspect-[2/3]",
}: {
  slug: string;
  name: string;
  componentName: string;
  previewUrl?: string | null;
  layoutJson?: unknown;
  demoData?: unknown;
  customData?: InvitationData;
  mode?: InvitationMode;
  className?: string;
}) {
  const data = customData ?? demoDataToInvitationData(demoData, layoutJson);

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