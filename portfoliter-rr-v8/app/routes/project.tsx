import { data } from "react-router";

import type { Route } from "./+types/project";
import { fetchPortfolio, fetchProject } from "~/lib/api.server";
import { shortDescription } from "~/lib/projects";
import { themeKey } from "~/lib/theme";
import { themeProjectPages } from "~/themes/registry";

// Unknown and draft slugs render the not-found page with a real 404 status. Returning (not throwing)
// keeps the portfolio in loaderData, so the page still shows the owner's name and active design.
export async function loader({ params, request }: Route.LoaderArgs) {
  const [portfolio, project] = await Promise.all([
    fetchPortfolio(request.signal),
    fetchProject(params.slug, request.signal),
  ]);
  if (!portfolio || !project) {
    return data({ portfolio, project: null }, { status: 404 });
  }
  return { portfolio, project };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const project = loaderData?.project;
  const owner = loaderData?.portfolio?.profile.fullName;
  if (!project) {
    return [{ title: "Project not found" }, { name: "robots", content: "noindex" }];
  }
  return [
    { title: owner ? `${project.title} | ${owner}` : project.title },
    { name: "description", content: shortDescription(project.summary) },
  ];
}

// Same design as the home page: the active theme's project page from the registry.
export default function ProjectPage({ loaderData }: Route.ComponentProps) {
  const { portfolio, project } = loaderData;
  const Page = themeProjectPages[themeKey(portfolio?.theme)];
  return <Page portfolio={portfolio} project={project} />;
}
