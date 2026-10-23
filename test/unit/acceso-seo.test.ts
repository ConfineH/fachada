import { describe, expect, it } from "vitest";

import { metadata } from "@/app/agencia/acceso/page";
import sitemap from "@/app/sitemap";

describe("agency login indexing", () => {
  it("marks the claim screen noindex", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("keeps /agencia/acceso out of the sitemap and lists the seven calculators", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/agencia/acceso"))).toBe(false);
    expect(urls.filter((url) => url.includes("/herramientas"))).toHaveLength(7);
  });
});
