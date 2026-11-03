import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { makeProject } from "~/test-utils/fixtures";
import { plateId, ProjectPlates, projectLikeHref } from "./ProjectPlates";

function renderPlates(email: string | null) {
  const projects = [makeProject({ id: 1, slug: "night-notes", title: "Night Notes & Co" }), makeProject({ id: 2, slug: "tidewatch", title: "Tidewatch" })];
  return renderToStaticMarkup(
    <MemoryRouter>
      <ProjectPlates id="personal-projects" title="Weekend flings" lede="Side projects." projects={projects} afterId="contact-title" email={email} ownerFirstName="Mira" />
    </MemoryRouter>,
  );
}

describe("dating-new like", () => {
  it("builds the like as an email to the owner that names the project", () => {
    expect(projectLikeHref("mira@example.com", "Night Notes & Co")).toBe("mailto:mira@example.com?subject=It's%20a%20match%3A%20Night%20Notes%20%26%20Co");
  });

  it("has no like when the owner has no email", () => {
    expect(projectLikeHref(null, "Tidewatch")).toBeNull();

    const html = renderPlates(null);

    expect(html).not.toContain("mailto:");
    expect(html).not.toContain(">Like<");
  });

  it("puts a like on every plate and sends Pass to the next plate, the last one to the next section", () => {
    const html = renderPlates("mira@example.com");

    expect(html.match(/href="mailto:mira@example.com\?subject=/g)).toHaveLength(2);
    expect(html).toContain(`id="${plateId("tidewatch")}"`);
    expect(html).toContain(`href="#${plateId("tidewatch")}"`);
    expect(html).toContain('href="#contact-title"');
  });
});
