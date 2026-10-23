import type { MetadataRoute } from "next";

import { agencyService } from "@/lib/container";
import { TENANT_TOOLS } from "@/lib/domain/tools/catalog";
import { toolTextsReviewedIso } from "@/lib/domain/tools/constants";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [agencies, cities] = await Promise.all([
    agencyService.search(undefined, { publicOnly: true }),
    agencyService.exploreCities({ publicOnly: true }),
  ]);

  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/explorar",
    "/agencias",
    "/metodologia",
    "/sobre",
    "/inquilinos",
    "/agregar-inmobiliaria",
    "/legal/aviso-legal",
    "/legal/privacidad",
    "/legal/cookies",
    "/legal/normas",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified,
    changeFrequency: path === "" || path === "/agencias" ? "daily" : "weekly",
    priority:
      path === "" ? 1 : path === "/agencias" || path === "/explorar" ? 0.8 : 0.5,
  }));

  const toolsUpdated = new Date(`${toolTextsReviewedIso()}T00:00:00.000Z`);
  const toolRoutes: MetadataRoute.Sitemap = [
    "/herramientas",
    ...TENANT_TOOLS.map((tool) => tool.path),
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: toolsUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const cityRoutes = cities.map((city) => ({
    url: absoluteUrl(`/ciudades/${city.slug}`),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const agencyRoutes = agencies.map((agency) => ({
    url: absoluteUrl(`/agencias/${agency.slug}`),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: agency.reviewCount > 0 ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...toolRoutes, ...cityRoutes, ...agencyRoutes];
}
