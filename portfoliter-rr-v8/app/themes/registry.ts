import type { ComponentType } from "react";

import type { ThemeKey } from "~/lib/theme";
import { DatingPage } from "./dating/DatingPage";
import { FieldGuidePage } from "./field-guide/FieldGuidePage";
import { ParcelPage } from "./parcel/ParcelPage";
import { SkytrainPage } from "./skytrain/SkytrainPage";
import { SpecSheetPage } from "./spec-sheet/SpecSheetPage";
import { StatusPage } from "./status-page/StatusPage";
import type { ThemePageProps } from "./types";

export const themePages: Record<ThemeKey, ComponentType<ThemePageProps>> = {
  dating: DatingPage,
  "field-guide": FieldGuidePage,
  parcel: ParcelPage,
  "spec-sheet": SpecSheetPage,
  skytrain: SkytrainPage,
  "status-page": StatusPage,
};

export const themeTitles: Record<ThemeKey, (fullName: string) => string> = {
  dating: (fullName) => `${fullName} on the port`,
  "field-guide": (fullName) => `Field Guide: ${fullName}`,
  parcel: (fullName) => `Fragile: ${fullName}`,
  "spec-sheet": (fullName) => `${fullName}, software engineer`,
  skytrain: (fullName) => `Next station: ${fullName}`,
  "status-page": (fullName) => `${fullName} status`,
};
