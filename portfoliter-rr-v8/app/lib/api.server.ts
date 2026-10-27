import type { Portfolio, ProjectDetail } from "./portfolio";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`missing env var ${name}`);
  }
  return value;
}

// GETs a read-key protected API path; a 404 becomes null.
async function getOrNull<T>(path: string, signal: AbortSignal): Promise<T | null> {
  const res = await fetch(`${requireEnv("API_BASE_URL")}${path}`, {
    headers: { "X-API-Key": requireEnv("API_READ_KEY") },
    signal,
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`portfolio api ${path} responded ${res.status}`);
  }
  return (await res.json()) as T;
}

// Returns null when the profile has not been created yet.
export function fetchPortfolio(signal: AbortSignal): Promise<Portfolio | null> {
  return getOrNull<Portfolio>("/v1/portfolio", signal);
}

// Returns null for unknown slugs and drafts.
export function fetchProject(slug: string, signal: AbortSignal): Promise<ProjectDetail | null> {
  return getOrNull<ProjectDetail>(`/v1/projects/${encodeURIComponent(slug)}`, signal);
}
