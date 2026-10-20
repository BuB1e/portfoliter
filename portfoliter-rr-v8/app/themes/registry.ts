import type { ComponentType } from "react";

import type { ThemeKey } from "~/lib/theme";
import { DatingPage } from "./dating/DatingPage";
import { FieldGuidePage } from "./field-guide/FieldGuidePage";
import { ParcelPage } from "./parcel/ParcelPage";
import type { ThemePageProps } from "./types";

export const themePages: Record<ThemeKey, ComponentType<ThemePageProps>> = {
  dating: DatingPage,
  "field-guide": FieldGuidePage,
  parcel: ParcelPage,
};

export const themeTitles: Record<ThemeKey, (fullName: string) => string> = {
  dating: (fullName) => `${fullName} on the port`,
  "field-guide": (fullName) => `Field Guide: ${fullName}`,
  parcel: (fullName) => `Fragile: ${fullName}`,
};
