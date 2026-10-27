import { data } from "react-router";

import type { Route } from "./+types/project";
import { fetchPortfolio, fetchProject } from "~/lib/api.server";
import { shortDescription } from "~/lib/projects";
import { DefaultProjectPage } from "~/components/DefaultProjectPage";

// Unknown and draft slugs render the not-found page with a real 404 status. Returning (not throwing)
// keeps the portfolio in loaderData, so the page can still show the owner's name and design.
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

export default function ProjectPage({ loaderData }: Route.ComponentProps) {
  return <DefaultProjectPage portfolio={loaderData.portfolio} project={loaderData.project} />;
}
