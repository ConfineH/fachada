import { afterEach, describe, expect, it } from "vitest";

import { getSiteUrl, isVercelAppHost } from "@/lib/site-url";

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
