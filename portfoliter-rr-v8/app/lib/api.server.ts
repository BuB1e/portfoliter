import type { PortfolioView, Project } from "./portfolio";

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
export function fetchPortfolio(signal: AbortSignal): Promise<PortfolioView | null> {
  return getOrNull<PortfolioView>("/v1/portfolio", signal);
}

// Returns null for unknown slugs and drafts.
export function fetchProject(slug: string, signal: AbortSignal): Promise<Project | null> {
  return getOrNull<Project>(`/v1/projects/${encodeURIComponent(slug)}`, signal);
}
