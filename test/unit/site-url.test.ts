import { afterEach, describe, expect, it } from "vitest";

import { getSiteUrl, isVercelAppHost, publicApiUrl } from "@/lib/site-url";

const ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_ENV",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL",
  "NODE_ENV",
] as const;

describe("site url", () => {
  const previous = Object.fromEntries(
    ENV_KEYS.map((key) => [key, process.env[key]]),
  );

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("keeps review requests on the same origin", () => {
    const previous = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { hostname: "fachada.app" } },
    });
    expect(publicApiUrl("/api/reviews")).toBe("/api/reviews");
    expect(publicApiUrl("/api/reviews/nueva-inmobiliaria")).toBe(
      "/api/reviews/nueva-inmobiliaria",
    );
    expect(publicApiUrl("/api/reviews/abc")).toBe("/api/reviews/abc");
    expect(publicApiUrl("/api/reviews")).not.toContain("www.fachada.app");
    if (previous === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previous,
      });
    }
  });

  it("treats vercel.app hosts as non-canonical", () => {
    expect(isVercelAppHost("fachada-tau.vercel.app")).toBe(true);
    expect(isVercelAppHost("https://fachada-tau.vercel.app")).toBe(true);
    expect(isVercelAppHost("fachada.app")).toBe(false);
    expect(isVercelAppHost("www.fachada.app")).toBe(false);
  });

  it("does not publish the vercel.app alias as the site url", () => {
    process.env.NODE_ENV = "production";
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "fachada-tau.vercel.app";
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getSiteUrl()).toBe("https://fachada.app");
  });
});
