import type { Route } from "./+types/home";
import { fetchPortfolio } from "../lib/api.server";
import { ProjectGroups } from "~/components/ProjectGroups";

export async function loader({ request }: Route.LoaderArgs) {
  return { portfolio: await fetchPortfolio(request.signal) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const profile = loaderData?.portfolio?.profile;
  return [
    { title: profile?.fullName ?? "Portfolio" },
    { name: "description", content: profile?.headline ?? "" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { portfolio } = loaderData;

  if (!portfolio) {
    return (
      <main className="p-8">
        <p>No portfolio published yet.</p>
      </main>
    );
  }

  const { profile } = portfolio;
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{profile.fullName}</h1>
        {profile.headline && <p className="text-lg">{profile.headline}</p>}
      </header>
      <ProjectGroups projects={portfolio.projects} />
      <details>
        <summary className="cursor-pointer text-sm text-gray-500">All portfolio data (JSON)</summary>
        <pre className="mt-2 overflow-x-auto text-sm">{JSON.stringify(portfolio, null, 2)}</pre>
      </details>
    </main>
  );
}
