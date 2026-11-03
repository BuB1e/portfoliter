# Plan: four new designs made with the taste skill

Goal: add four site designs built with the taste skill (`taste-skill:design-taste-frontend`).

- `parcel-new`: a new version of Parcel (the live design).
- `dating-new`: a new version of Dating app.
- Two new designs with concepts no current design uses.

The existing designs (`parcel`, `dating` and the other nine) are not changed. The owner switches
between designs with `set_theme` as before.

Strictness (chosen): keep each concept, follow the skill's house rules (no monospace outside code,
no thin rules, no stickers or decorative shapes, no shadows at rest, no gradients, no pill badges,
no small uppercase labels, at most 2 typefaces) and add substance: bigger type, full content, real
pictures.

## Decisions to approve

1. **Which two new concepts.** Pick two of the three in "New designs" below.
2. **Pictures.** Designs are templates for anyone who clones the repo, so they render only the
   portfolio's own pictures: the avatar and project covers. Pictures found in public archives
   (the skill's `assets.mjs`) would be about one owner, so they are not used. Missing pictures are
   drawn in code from the data (for example a barcode made from the tracking number). If the skill's
   checker fails a page for having fewer than 4 real pictures, I mark that rule as allowed with a
   one-line reason, the way the skill handles brand constraints.
3. **Branch.** Following the branch rule: build on `develop` (new branch `feature/taste-themes` from
   `develop`), then merge `develop` into `feature/harit-som`. Commits as BuB1e.
4. **Catalog order.** The four keys go at the end of the list: `..., retro-desktop, parcel-new,
   dating-new, <new-1>, <new-2>`. `plain` stays the default.

## Redesigned: parcel-new

- Direction drawn: `page-is-the-object` (the page is built as the real object from the subject's world).
- Idea: on this page, **the shipping label** becomes **the first screen**. It is one large paper
  panel in the true 4x6 inch label shape. It holds the name, headline, location ("ship to"),
  email, the tracking number (GitHub handle plus start year, as today) and a barcode drawn from that
  tracking number.
- Sections as parcel paperwork, each with its own layout:
  - The bio is the sender's note.
  - Experience is the tracking history: one large date column and the events beside it.
  - Projects are the packing list, with project covers shown large.
  - Education is the certificate of origin.
  - Certifications are the customs declaration.
  - Skills are the contents list.
- The interactive feature: **bubble wrap you can pop**, kept from today's design because it is the
  one thing a visitor can do. It is made larger, works with keyboard and touch, and shows the plain
  sheet without JavaScript.
- Dropped: the tape strips, stickers, the stamp, rotated panels, dashed borders and box shadows.
  The kraft paper colour stays as a flat colour field.

## Redesigned: dating-new

- Direction drawn: `pinned-poster` (one thing stays fixed while the content scrolls beneath it).
- Idea: on this page, **the profile** stays pinned like the top of a dating app while **each
  project's cover passes beneath it, full height, like profile photos you swipe through**.
  The covers are the real pictures this direction needs, and 9 published projects have one.
  A project without a cover gets a drawn title card in the palette.
- The interactive feature: on each project, **pass or like**. A like opens an email
  ("It's a match: <project>") written to the owner, the same idea as today's match dialog, with a
  plain link when JavaScript is off.
- Dropped: the floating card deck chrome, pill chips and rounded raised cards. Kept: the jokes
  (exes, humble brags, verified), the dark ground and one warm accent colour.

## New designs

Chosen 2026-11-03: **A. Preprint** (`preprint`) and **C. Exhibition** (`exhibition`). B is not built.

### A. Preprint (recommended)

- Direction drawn: `type-only-statement` (the first screen is words, colour and space only).
- Idea: on this page, **the engineer's résumé** becomes **a typeset academic paper**. The paper has:
  - the name as the title and the headline as the subtitle, with location and email as the affiliation line;
  - the bio as the abstract;
  - experience, projects and education as numbered sections, written as words, not 01 or 02;
  - project covers as numbered figures with captions;
  - links and certifications as the references.
  It fits a builder of a LaTeX résumé editor, and no current design is a paper. Broadsheet is a newspaper.
- The interactive feature: **Cite this engineer**. Pick a format (BibTeX, APA) and copy it, built
  from the portfolio data. The citation sits in a real code block, the one place monospace is allowed.

### B. Transcript

- Direction drawn: `dark-room` (one dark field from top to bottom, with lit exhibits in it).
- Idea: on this page, **the conversation that edited the site through MCP** becomes **the page
  itself**. A visitor's questions ("What do you build?", "Where have you worked?") are answered
  with the portfolio's own data.
- The interactive feature: **ask a question**. Pick from the questions, and the answer section
  comes into view. Without JavaScript, every answer is shown in order.
- Risk: chat bubbles look a lot like the skill's banned row of identical cards, so this is
  harder to make look designed.

### C. Exhibition

- Direction drawn: `dark-room`.
- Idea: on this page, **each project** becomes **an exhibit in a dark gallery**. Each project is
  lit on its own screen, with a wall label showing title, dates, materials (its skills) and a summary.
- The interactive feature: walk the gallery from room to room (work, personal, university) with the arrow keys.
- Risk: it needs many large pictures. With few covers it can look empty.

## Wiring (same for every new design)

- `app/themes/<key>/<Name>Page.tsx` and `<Name>ProjectPage.tsx` are thin renderers of the one
  `PortfolioView`. They use `OrderedSections` for the owner's section order and the shared
  `lib/fields`, `lib/labels` and `lib/projects` helpers, with no new grouping logic.
- Components go in `app/components/<key>/`. Tokens are prefixed per design in `app/app.css`
  (for example `--color-pn-*`), plus a `[data-theme="<key>"]` block for the page background.
- Registry: add the key to `themePages`, `themeProjectPages`, `themeTitles` (`app/themes/registry.ts`)
  and `FEATURED_LABELS` (`app/themes/fields.test.tsx`). Add it to `THEME_KEYS` (`app/lib/theme.ts`)
  and to `themeCatalog` (`portfoliter-go/internal/admin/theme_catalog.go`) in the same order.
- Fonts: each design loads its own Google Fonts stylesheet, as today.
- Motion: entrance motion per section and feedback on every control, using transform and opacity only,
  with a `prefers-reduced-motion` fallback. Nothing stays hidden if JavaScript fails.

## Order of work (one design at a time, each finished before the next)

1. parcel-new
2. dating-new
3. new design 1
4. new design 2

For each design, I follow the skill's steps:
1. Draw the full direction sheet.
2. Write the copy for each section.
3. Build the page and its project page.
4. Run `lint.mjs` and `inspect.mjs` at 1440, 768 and 390 px wide against the production build.
5. Read every screenshot, write the critique, and fix the top problems (at most 3 rounds).
6. Add the motion.
7. Inspect again.

Scratch output goes to `.taste-skill/`, which is not committed.

## Test plan

Existing tests already loop over every key in `THEME_KEYS`, so each new design must pass:

- `app/themes/themes.test.tsx`: Work, then Personal, then University sections in that order, with a
  link on each card to `/projects/<slug>`, short descriptions inside the link and clamped, a
  project page and a not-found state.
- `app/themes/fields.test.tsx`: every published field of the fictional sample profile is shown
  on the home and project pages, with no placeholder text for empty fields. A featured marker is
  added per design.
- `app/themes/sectionOrder.test.tsx`: sections follow the backend's `sectionOrder`.
- Go `TestThemeCatalogMatchesFrontend`: frontend and backend theme lists match.

New unit tests (vitest), one per interactive feature:

- `parcel-new` bubble wrap: popping changes the state; the sheet renders without JavaScript.
- `dating-new` like: the email link is built from the project title and the owner's email; there is
  no link when the email is null.
- Preprint citation: BibTeX and APA strings are built from the profile; empty fields are left out,
  never printed as "null".
- Transcript, if chosen: every answer section renders in the no-JavaScript markup.

Commands: `npm run typecheck`, `npm test` (frontend), `go test ./...` (backend).
Browser check: the skill's `inspect.mjs` screenshots at 3 widths for the home page and one project page.

## Not in scope

- Changing or removing the existing 11 designs.
- Switching the live design. After the work, `set_theme` stays your call.
- Deploying to the server.
