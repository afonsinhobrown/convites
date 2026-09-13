import type { ComponentType } from "react";
import type { InvitationData } from "./types";
import type { LayoutJson } from "@/lib/designer-layout";
import { LayoutFromJson } from "./LayoutFromJson";
import { MagnoliaGoldLayout } from "./layouts/MagnoliaGoldLayout";
import { MagnoliaClassicaLayout } from "./layouts/MagnoliaClassicaLayout";
import { MagnoliaCasalLayout } from "./layouts/MagnoliaCasalLayout";
import { MagnoliaOrganicaLayout } from "./layouts/MagnoliaOrganicaLayout";
import { BasicLayout } from "./layouts/BasicLayout";

type LayoutProps = { data: InvitationData };

const LAYOUTS: Record<string, ComponentType<LayoutProps>> = {
  MagnoliaGoldLayout,
  MagnoliaClassicaLayout,
  MagnoliaCasalLayout,
  MagnoliaOrganicaLayout,
  "magnolia-gold": MagnoliaGoldLayout,
  "magnolia-classica": MagnoliaClassicaLayout,
  "magnolia-casal": MagnoliaCasalLayout,
  "magnolia-organica": MagnoliaOrganicaLayout,
};

export function InvitationRenderer({
  layout,
  data,
  layoutJson,
  previewUrl,
}: {
  layout: string;
  data: InvitationData;
  layoutJson?: LayoutJson | null;
  previewUrl?: string | null;
}) {
  if (layoutJson && Object.keys(layoutJson).length > 0) {
    return <LayoutFromJson layoutJson={layoutJson} previewUrl={previewUrl} data={data} />;
  }
  const Layout = LAYOUTS[layout] ?? BasicLayout;
  return <Layout data={data} />;
}