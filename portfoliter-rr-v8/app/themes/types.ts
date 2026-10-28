import type { PortfolioView, Project } from "~/lib/portfolio";

// null means the profile has not been created yet; each design renders its own empty state.
export interface ThemePageProps {
  portfolio: PortfolioView | null;
}

// The /projects/:slug page. project is null for unknown or draft slugs (the route answers 404),
// and each design renders its own not-found state.
export interface ThemeProjectPageProps {
  portfolio: PortfolioView | null;
  project: Project | null;
}
