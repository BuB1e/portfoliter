import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Route } from "./+types/project";
import { makePortfolio, makeProjectDetail } from "~/test-utils/fixtures";

const api = vi.hoisted(() => ({ fetchPortfolio: vi.fn(), fetchProject: vi.fn() }));
vi.mock("~/lib/api.server", () => api);

const { loader } = await import("./project");

function loaderArgs(slug: string): Route.LoaderArgs {
  return {
    params: { slug },
    request: new Request(`http://localhost/projects/${slug}`),
  } as unknown as Route.LoaderArgs;
}

describe("project loader", () => {
  beforeEach(() => {
    api.fetchPortfolio.mockResolvedValue(makePortfolio());
  });

  it("returns the project and portfolio for a published slug", async () => {
    const project = makeProjectDetail();
    api.fetchProject.mockResolvedValue(project);

    const result = await loader(loaderArgs("tidewatch"));

    expect(api.fetchProject).toHaveBeenCalledWith("tidewatch", expect.any(AbortSignal));
    expect(result).toEqual({ portfolio: makePortfolio(), project });
  });

  it("answers 404 with no project for an unknown or draft slug", async () => {
    api.fetchProject.mockResolvedValue(null);

    const result = await loader(loaderArgs("draft-thesis"));

    expect(result).toMatchObject({ init: { status: 404 }, data: { project: null, portfolio: makePortfolio() } });
  });

  it("answers 404 when no profile exists yet", async () => {
    api.fetchPortfolio.mockResolvedValue(null);
    api.fetchProject.mockResolvedValue(makeProjectDetail());

    const result = await loader(loaderArgs("tidewatch"));

    expect(result).toMatchObject({ init: { status: 404 }, data: { project: null } });
  });
});
