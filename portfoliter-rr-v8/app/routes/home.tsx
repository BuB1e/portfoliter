import type { Route } from "./+types/home";
import { fetchPortfolio } from "../lib/api.server";

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
    <main className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">{profile.fullName}</h1>
      {profile.headline && <p className="text-lg">{profile.headline}</p>}
      <pre className="text-sm overflow-x-auto">
        {JSON.stringify(portfolio, null, 2)}
      </pre>
    </main>
  );
}
