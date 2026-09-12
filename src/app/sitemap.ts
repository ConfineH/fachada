import type { MetadataRoute } from "next";

import { agencyService } from "@/lib/container";
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
    "/agencia/acceso",
    "/agregar-inmobiliaria",
    "/legal/aviso-legal",
    "/legal/privacidad",
    "/legal/cookies",
    "/legal/normas",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified,
    changeFrequency: path === "" || path === "/agencias" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/agencias" || path === "/explorar" ? 0.8 : 0.5,
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

  return [...staticRoutes, ...cityRoutes, ...agencyRoutes];
}
