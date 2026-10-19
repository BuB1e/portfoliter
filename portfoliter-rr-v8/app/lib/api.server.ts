import type { Portfolio } from "./portfolio";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`missing env var ${name}`);
  }
  return value;
}

// Returns null when the profile has not been created yet.
export async function fetchPortfolio(
  signal: AbortSignal,
): Promise<Portfolio | null> {
  const res = await fetch(`${requireEnv("API_BASE_URL")}/v1/portfolio`, {
    headers: { "X-API-Key": requireEnv("API_READ_KEY") },
    signal,
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`portfolio api responded ${res.status}`);
  }
  return (await res.json()) as Portfolio;
}
