import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { themeKey } from "./lib/theme";
import type { loader as homeLoader } from "./routes/home";
import type { loader as projectLoader } from "./routes/project";

// Each design page loads its own font stylesheet.
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "icon", href: "/favicon.ico" },
  { rel: "icon", href: "/icon-512.png", type: "image/png", sizes: "512x512" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
];

// Visitor tracking (moni-ter). Read at runtime on the server; rendered only when both are set.
export function loader() {
  const site = process.env.MONITER_SITE_DOMAIN ?? "";
  const key = process.env.MONITER_SITE_KEY ?? "";
  return { moniter: site && key ? { site, key } : null };
}

export function Layout({ children }: { children: React.ReactNode }) {
  // Set on <html> during SSR so the page background matches the design before hydration.
  // Both the home page and project pages carry the portfolio, so both get the active design.
  const home = useRouteLoaderData<typeof homeLoader>("routes/home");
  const project = useRouteLoaderData<typeof projectLoader>("routes/project");
  const root = useRouteLoaderData<typeof loader>("root");
  const moniter = root?.moniter;
  const theme = home?.portfolio?.theme ?? project?.portfolio?.theme;
  return (
    <html lang="en" data-theme={themeKey(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {moniter && (
          <script
            defer
            src="https://moni-ter.haritsom.com/t.js"
            data-site={moniter.site}
            data-key={moniter.key}
          />
        )}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
