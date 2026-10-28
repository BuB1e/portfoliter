# The portfolio view

`GET /v1/portfolio` returns one normalized view of everything that is public. Every design in
`portfoliter-rr-v8` renders this shape and nothing else, so grouping, linking and empty-value rules
are decided once, on the backend (`portfoliter-go/internal/portfolio/view.go`), instead of in each
design. `GET /v1/projects/{slug}` returns one entry of `projects`, in exactly the same shape.

The frontend type is `PortfolioView` in `portfoliter-rr-v8/app/lib/portfolio.ts`. A full example is
pinned by the Go test fixture: `portfoliter-go/internal/httpapi/testdata/portfolio_view.golden.json`.

## Rules

| Rule | Detail |
|---|---|
| Published only | Experiences, projects, education, certifications and sections appear only when `is_published`. Profile, links and skills are always public. |
| Nulls | Optional fields are `null` when unset; blank or whitespace-only text is stored as given but returned as `null`. Required text (`bio`, `summary`, `content`, `description`, ...) is always a string, `""` when empty. Lists are never `null`, only `[]`. |
| Dates | `YYYY-MM-DD` strings or `null`. Format them yourself (see `app/lib/format.ts`) so server and browser render the same text. |
| Files | `avatarUrl`, `resumeUrl`, `coverUrl` are presigned links that expire after `R2_GET_URL_TTL`. |
| Links between rows | Each project embeds the published `experience` (WORK) or `education` (UNIVERSITY) it belongs to. Both the id and the object are `null` when unset or when the linked row is a draft, so they always agree. |
| Skill groups | `skillGroups` holds every skill grouped by category, case-insensitively, in the order categories first appear in the skill catalog (`sort_order`, then name). Skills without a category go last in the group with key `"other"` and `category: null`; the frontend owns its label ("Other", `app/lib/labels.ts`). A category literally named "other" joins that group. |
| Custom sections | `items` is the raw JSON as stored. `entries` is every item with text, read into `{title, detail, url}` (see below). Render `entries`. |

## Order

| List | Order |
|---|---|
| `links` | `sort_order`, then id |
| `experiences` | `sort_order`, then start date (newest first), then id |
| `projects` | `sort_order`, then id. Designs split them into Work, Personal, University with `groupProjects()`. |
| `skills`, every `skills` list inside rows | skill `sort_order`, then name |
| `education` | `sort_order`, then start date (or end date when there is no start; newest first, undated last), then id |
| `certifications` | `sort_order`, then issued date (newest first, undated last), then id |
| `sections` | `sort_order`, then id |

## Section order

`sectionOrder` is the order of the home page's sections, as stable keys. Every design renders its
sections by walking this list, so the order is decided here once instead of in each design. The
default is the owner's resume order, `DefaultSectionOrder` in `view.go`:

| Key | Section | Rows |
|---|---|---|
| `about` | About / bio | `profile.bio` |
| `education` | Education | `education` |
| `skills` | Skills | `skillGroups` |
| `experience` | Experience (jobs) | `experiences` |
| `projects` | Projects: Work, Personal, University groups, in that order | `projects` |
| `certifications` | Certifications | `certifications` |
| `extras` | Custom sections (prompts, awards, talks, ...), in each design's own order | `sections` |

- The header (each design's identity block) and the footer/contact block are not sections: they
  stay first and last. Design chrome (top bars, desktop icons, the taskbar, receipt totals) stays put.
- Each design maps every key to its own themed block and wording (a design that keeps the bio in its
  header has no `about` block). Empty sections are not rendered.
- In-page navigation (the quest menu, the retro taskbar, the broadsheet "Inside today" index and
  masthead) lists its entries in the same order.
- The frontend reads it through `resolveSectionOrder()` in `app/lib/sectionOrder.ts`: unknown keys
  are skipped and missing keys are appended in the default order, so a section can never disappear,
  and a response without `sectionOrder` renders the default order.

The order is a constant for now. To make it configurable later, add a `section_order text[]` column to
`site_settings`, an MCP tool that accepts only the keys above (each once), and fill `sectionOrder`
from it in `normalize`, falling back to `DefaultSectionOrder`. No frontend change is needed.

## Shape

```jsonc
{
  "theme": "parcel",                       // active design key; "" until set_theme is used
  "sectionOrder": ["about", "education", "skills", "experience", "projects", "certifications", "extras"],
  "profile": {
    "fullName": "Mira Castellanos", "headline": "Platform engineer", "bio": "...",
    "avatarUrl": "https://..." | null, "location": "Porto, Portugal" | null,
    "email": "mira@example.com" | null, "resumeUrl": "https://..." | null
  },
  "links": [{ "platform": "github", "url": "https://..." }],
  "experiences": [{
    "id": 1, "company": "Lumen Freight", "role": "Staff Engineer",
    "employmentType": "full-time" | null,  // free text as written; the frontend labels it
    "location": "Porto, Portugal" | null,
    "startDate": "2024-03-01", "endDate": null,        // null end = current job
    "description": "...", "skills": ["Go", "PostgreSQL"]
  }],
  "projects": [{
    "id": 1, "slug": "freight-router", "title": "Freight Router",
    "projectType": "WORK",                  // WORK | PERSONAL | UNIVERSITY
    "summary": "card text, plain, up to 200 chars", "content": "markdown for /projects/<slug>",
    "repoUrl": null, "demoUrl": null, "coverUrl": null,
    "startDate": null, "endDate": null, "isFeatured": true, "skills": ["Go"],
    "experienceId": 1, "experience": { /* the experience above, with its skills */ } | null,
    "educationId": null, "education": { /* an education entry */ } | null
  }],
  "skills": [{ "name": "Go", "category": "Language" | null }],
  "skillGroups": [
    { "key": "language", "category": "Language", "skills": ["Go", "TypeScript"] },
    { "key": "other", "category": null, "skills": ["Terraform"] }
  ],
  "education": [{
    "id": 1, "institution": "Porto Polytechnic", "degree": "B.Sc." | null,
    "field": "Software Engineering" | null, "startDate": null, "endDate": "2022-07-31",
    "description": "Final grade 17/20"
  }],
  "certifications": [{
    "id": 2, "name": "Cloud Architect", "issuer": "Cloud Co",
    "issuedDate": "2024-06-15" | null, "credentialUrl": "https://..." | null
  }],
  "sections": [{
    "key": "talks", "title": "Talks",
    "items": [ /* raw JSON as stored */ ],
    "entries": [{ "title": "PyCon Lisbon", "detail": "Speaker" | null, "url": "https://..." | null }]
  }]
}
```

## How section items become entries

Each item of a free-form section is read as follows; items with no text at all are skipped.

- A string or number is the title.
- An object's title is its first `name`, `title`, `question`, `label` or `heading`. The detail joins
  `note`, `answer`, `description`, `detail`, `text`, `issuer`, `value`, `date`, `year`, then every
  other key's value (alphabetical, since JSONB does not keep key order), with `", "`. Without a title
  key, the first of those values becomes the title.
- Lists and nested objects are flattened to text; booleans and `null` have none.
- `url`, `link` or `href` becomes `url` only when it is `http://` or `https://`.

So `{"question": "Favourite bug?", "answer": "Off by one"}` is `{title: "Favourite bug?", detail:
"Off by one"}`, and `{"label": "English", "level": "Professional"}` is `{title: "English", detail:
"Professional"}`.

## Compatibility

The view only adds fields to the earlier response: `sectionOrder`, `skillGroups`, `projects[].experience`,
`projects[].education`, `certifications[].id` and `sections[].entries`. The project endpoint drops its
separate "detail" type: it was already the project fields plus `experience` and `education`, which
every project now has.

Two behaviour changes, neither of which breaks a client that checks values for truthiness:

- Blank optional text (for example a location saved as `""`) is now `null`.
- Undated certifications and education rows now sort after dated ones within the same `sort_order`
  (PostgreSQL put them first before). Set `sort_order` with `reorder` to force any order.
