import { ProjectGroups } from "~/components/ProjectGroups";
import type { ThemePageProps } from "../types";

// The template's starting point: a plain page that loads the portfolio and prints it.
export function PlainPage({ portfolio }: ThemePageProps) {
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
    </main>
  );
}
