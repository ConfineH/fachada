export const DEFAULT_SITE_URL = "https://fachada.app";

/** Production alias that should never appear in the address bar or in canonicals. */
export const LEGACY_VERCEL_HOST = "fachada-tau.vercel.app";

export function isVercelAppHost(host: string) {
  const bare = host.replace(/^https?:\/\//, "").split("/")[0]?.split(":")[0] ?? "";
  return bare === LEGACY_VERCEL_HOST || bare.endsWith(".vercel.app");
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

function withHttps(host: string) {
  const trimmed = host.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${trimmed}`;
}

/**
 * Same-origin path for review requests.
 * A hop to www.fachada.app is a 308 back to fachada.app. The CORS preflight
 * dies on that redirect, and a redirected POST can drop the body (including
 * a photo up to 3 MB). The page is already on the host that serves the API.
 */
export function publicApiUrl(path: string) {
  return path;
}

/** Canonical public origin. Override with NEXT_PUBLIC_SITE_URL when the domain changes. */
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && !isVercelAppHost(explicit)) return stripTrailingSlash(explicit);

  if (process.env.VERCEL_ENV === "production") {
    const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (productionHost && !isVercelAppHost(productionHost)) {
      return withHttps(productionHost);
    }
  }

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    return "http://localhost:3000";
  }

  return DEFAULT_SITE_URL;
}
