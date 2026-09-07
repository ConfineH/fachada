import Link from "next/link";

import { CityDirectoryCard } from "@/components/city-directory-card";
import { PublicShell } from "@/components/public-shell";
import { SearchForm } from "@/components/search-form";
import {
  averageRatingForCity,
  groupCitiesByLetter,
} from "@/lib/domain/explore";
import { agencyService, usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Explorar inmobiliarias por ciudad — Fachada",
  description:
    "Consulta valoraciones de inquilinos y propietarios por ciudad en España.",
};

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const cities = await agencyService.exploreCities({ publicOnly: true });
  const agencies = await agencyService.search(undefined, { publicOnly: true });
  const totalAgencies = cities.reduce((sum, c) => sum + c.agencyCount, 0);
  const municipalityCount = cities.length;

  const filtered = q
    ? cities.filter((c) =>
        c.city.toLocaleLowerCase("es").includes(q.toLocaleLowerCase("es")),
      )
    : cities;

  const groups = groupCitiesByLetter(filtered);
  const featuredSlug = [...cities].sort(
    (a, b) => b.agencyCount - a.agencyCount,
  )[0]?.slug;

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl motion-fade-rise">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Directorio nacional
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900">
                Explorar inmobiliarias por ciudad
              </h1>
              <p className="mt-3 text-zinc-600">
                Registro público de valoraciones por zona geográfica. Las notas
                medias reflejan reseñas verificadas de inquilinos y
                propietarios.
              </p>
            </div>
            <SearchForm variant="explore" initialQuery={q ?? ""} />
          </div>
        </div>
      </section>

      <div className="border-b border-stone-200 bg-zinc-100/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-8">
          <div className="flex flex-wrap gap-10">
            <div>
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {totalAgencies.toLocaleString("es-ES")}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Agencias listadas
              </p>
            </div>
            <div>
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {municipalityCount.toLocaleString("es-ES")}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Municipios cubiertos
              </p>
            </div>
          </div>
          <span className="badge-trust text-xs">Datos del registro público</span>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {groups.length === 0 && (
          <p className="text-zinc-600">
            No hay ciudades que coincidan.{" "}
            <Link href="/explorar" className="link-brand">
              Ver todas
            </Link>
          </p>
        )}

        {groups.map(([letter, letterCities]) => (
          <section key={letter} className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center bg-zinc-900 text-sm font-bold text-white">
                {letter}
              </span>
              <span className="text-sm font-medium text-zinc-500">
                {letterCities.length}{" "}
                {letterCities.length === 1 ? "ciudad" : "ciudades"}
              </span>
            </div>
            <ul className="motion-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {letterCities.map((city) => (
                <li key={city.slug}>
                  <CityDirectoryCard
                    city={city.city}
                    slug={city.slug}
                    agencyCount={city.agencyCount}
                    reviewCount={city.reviewCount}
                    averageRating={averageRatingForCity(agencies, city.slug)}
                    featured={city.slug === featuredSlug}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </PublicShell>
  );
}
