import type { ComponentType } from "react";
import type { InvitationData, InvitationMode } from "./types";
import type { LayoutJson } from "@/lib/designer-layout";
import { LayoutFromJson } from "./LayoutFromJson";
import { MagnoliaClassicaLayout } from "./layouts/MagnoliaClassicaLayout";
import { MagnoliaCasalLayout } from "./layouts/MagnoliaCasalLayout";
import { MagnoliaOrganicaLayout } from "./layouts/MagnoliaOrganicaLayout";
import { BasicLayout } from "./layouts/BasicLayout";

type LayoutProps = { data: InvitationData; mode: InvitationMode };

const LAYOUTS: Record<string, ComponentType<LayoutProps>> = {
  MagnoliaClassicaLayout,
  MagnoliaCasalLayout,
  MagnoliaOrganicaLayout,
  "magnolia-classica": MagnoliaClassicaLayout,
  "magnolia-casal": MagnoliaCasalLayout,
  "magnolia-organica": MagnoliaOrganicaLayout,
};

export function InvitationRenderer({
  layout,
  data,
  layoutJson,
  previewUrl,
  mode = "preview",
}: {
  layout: string;
  data: InvitationData;
  layoutJson?: LayoutJson | null;
  previewUrl?: string | null;
  mode?: InvitationMode;
}) {
  if (layoutJson && Object.keys(layoutJson).length > 0) {
    return (
      <LayoutFromJson
        layoutJson={layoutJson}
        previewUrl={previewUrl}
        data={data}
        mode={mode}
      />
    );
  }
  const Layout = LAYOUTS[layout] ?? BasicLayout;
  return <Layout data={data} mode={mode} />;
}