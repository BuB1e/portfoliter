import type { Route } from "./+types/home";
import { fetchPortfolio } from "~/lib/api.server";
import { themeKey } from "~/lib/theme";
import { themePages, themeTitles } from "~/themes/registry";

export async function loader({ request }: Route.LoaderArgs) {
  return { portfolio: await fetchPortfolio(request.signal) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const portfolio = loaderData?.portfolio;
  const profile = portfolio?.profile;
  return [
    { title: profile ? themeTitles[themeKey(portfolio.theme)](profile.fullName) : "Portfoliter" },
    { name: "description", content: profile?.headline ?? "" },
  ];
}

// The active design comes from site_settings.theme, switched through the set_theme MCP tool.
export default function Home({ loaderData }: Route.ComponentProps) {
  const { portfolio } = loaderData;
  const Page = themePages[themeKey(portfolio?.theme)];
  return <Page portfolio={portfolio} />;
}
