import type { Portfolio } from "~/lib/portfolio";

// null means the profile has not been created yet; each design renders its own empty state.
export interface ThemePageProps {
  portfolio: Portfolio | null;
}
