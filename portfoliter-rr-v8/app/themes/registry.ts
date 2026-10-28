import type { ComponentType } from "react";

import { paperName } from "~/components/broadsheet/Masthead";
import { DefaultProjectPage } from "~/components/DefaultProjectPage";
import type { ThemeKey } from "~/lib/theme";
import { BroadsheetPage } from "./broadsheet/BroadsheetPage";
import { BroadsheetProjectPage } from "./broadsheet/BroadsheetProjectPage";
import { DatingPage } from "./dating/DatingPage";
import { DatingProjectPage } from "./dating/DatingProjectPage";
import { FieldGuidePage } from "./field-guide/FieldGuidePage";
import { FieldGuideProjectPage } from "./field-guide/FieldGuideProjectPage";
import { ParcelPage } from "./parcel/ParcelPage";
import { ParcelProjectPage } from "./parcel/ParcelProjectPage";
import { PlainPage } from "./plain/PlainPage";
import { QuestLogPage } from "./quest-log/QuestLogPage";
import { QuestLogProjectPage } from "./quest-log/QuestLogProjectPage";
import { ReceiptPage } from "./receipt/ReceiptPage";
import { ReceiptProjectPage } from "./receipt/ReceiptProjectPage";
import { RetroDesktopPage } from "./retro-desktop/RetroDesktopPage";
import { RetroDesktopProjectPage } from "./retro-desktop/RetroDesktopProjectPage";
import { SkytrainPage } from "./skytrain/SkytrainPage";
import { SkytrainProjectPage } from "./skytrain/SkytrainProjectPage";
import { SpecSheetPage } from "./spec-sheet/SpecSheetPage";
import { SpecSheetProjectPage } from "./spec-sheet/SpecSheetProjectPage";
import { StatusPage } from "./status-page/StatusPage";
import { StatusProjectPage } from "./status-page/StatusProjectPage";
import type { ThemePageProps, ThemeProjectPageProps } from "./types";

export const themePages: Record<ThemeKey, ComponentType<ThemePageProps>> = {
  plain: PlainPage,
  dating: DatingPage,
  "field-guide": FieldGuidePage,
  parcel: ParcelPage,
  "spec-sheet": SpecSheetPage,
  skytrain: SkytrainPage,
  "status-page": StatusPage,
  receipt: ReceiptPage,
  broadsheet: BroadsheetPage,
  "quest-log": QuestLogPage,
  "retro-desktop": RetroDesktopPage,
};

// /projects/:slug in each design; the Record type makes a new theme fail typecheck until it has one.
export const themeProjectPages: Record<ThemeKey, ComponentType<ThemeProjectPageProps>> = {
  plain: DefaultProjectPage,
  dating: DatingProjectPage,
  "field-guide": FieldGuideProjectPage,
  parcel: ParcelProjectPage,
  "spec-sheet": SpecSheetProjectPage,
  skytrain: SkytrainProjectPage,
  "status-page": StatusProjectPage,
  receipt: ReceiptProjectPage,
  broadsheet: BroadsheetProjectPage,
  "quest-log": QuestLogProjectPage,
  "retro-desktop": RetroDesktopProjectPage,
};

export const themeTitles: Record<ThemeKey, (fullName: string) => string> = {
  plain: (fullName) => fullName,
  dating: (fullName) => `${fullName} on the port`,
  "field-guide": (fullName) => `Field Guide: ${fullName}`,
  parcel: (fullName) => `Fragile: ${fullName}`,
  "spec-sheet": (fullName) => `${fullName}: spec sheet`,
  skytrain: (fullName) => `Next station: ${fullName}`,
  "status-page": (fullName) => `${fullName} status`,
  receipt: (fullName) => `Receipt: ${fullName}`,
  broadsheet: (fullName) => `${paperName(fullName)}, the personal paper of ${fullName}`,
  "quest-log": (fullName) => `${fullName}: quest log`,
  "retro-desktop": (fullName) => `${fullName}'s desktop`,
};
