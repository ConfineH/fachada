import Link from "next/link";
import { redirect } from "next/navigation";

import { AgencyResultList } from "@/components/agency-result-list";
import { CityDirectoryCard } from "@/components/city-directory-card";
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { SearchForm } from "@/components/search-form";
import { homeDocumentedAgencies } from "@/lib/domain/agency-browse";
import { agencyService, usingSupabase } from "@/lib/container";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; orden?: string }>;
}) {
  const { q, orden } = await searchParams;
  if (q?.trim()) {
    const params = new URLSearchParams({ q: q.trim() });
    if (orden) params.set("orden", orden);
    redirect(`/agencias?${params.toString()}`);
  }

  const [agencies, cities] = await Promise.all([
    agencyService.search(undefined, { publicOnly: true }),
    agencyService.exploreCities({ publicOnly: true }),
  ]);
  const totalAgencies = cities.reduce((sum, c) => sum + c.agencyCount, 0);
  const totalReviews = cities.reduce((sum, c) => sum + c.reviewCount, 0);
  const featuredCities = [...cities]
    .sort((a, b) => b.agencyCount - a.agencyCount)
    .slice(0, 5);
  const documented = homeDocumentedAgencies(agencies);
  const sampleAgencies = documented.preview.slice(0, 3);
  const sampleReviews = (
    await Promise.all(
      sampleAgencies.map((agency) =>
        agencyService.getBySlug(agency.slug, { publicOnly: true }),
      ),
    )
  )
    .flatMap((agency) =>
      (agency?.reviews ?? []).slice(0, 1).map((review) => ({
        name: agency!.name,
        role: review.role,
        rating: review.rating,
        body: review.body,
      })),
    )
    .slice(0, 3);

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div className="motion-fade-rise">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Archivo público independiente
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                Reseñas reales de inmobiliarias en España
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
                Consulta cómo gestionan fianzas, reparaciones y la relación con
                inquilinos y propietarios. Valoraciones separadas por
                perspectiva.
              </p>
              <p className="mt-6 text-xs font-medium uppercase tracking-wide text-zinc-500">
                {totalAgencies.toLocaleString("es-ES")} agencias evaluadas ·{" "}
                {totalReviews.toLocaleString("es-ES")} reseñas publicadas ·
                actualización continua
              </p>
            </div>
            <div className="motion-fade-rise" style={{ animationDelay: "80ms" }}>
              <SearchForm variant="hero" />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-14">
        {featuredCities.length > 0 && (
          <Reveal>
            <section>
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Ciudades destacadas
                </h2>
                <Link href="/explorar" className="link-brand text-sm">
                  Ver directorio completo
                </Link>
              </div>
              <ul className="motion-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCities.map((city, index) => (
                  <li
                    key={city.slug}
                    className={index === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}
                  >
                    <CityDirectoryCard
                      city={city.city}
                      slug={city.slug}
                      agencyCount={city.agencyCount}
                      reviewCount={city.reviewCount}
                      size={index === 0 ? "hero" : "tile"}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        <Reveal className="mt-20">
          <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Datos contrastados, no opiniones al azar
              </h2>
              <p className="mt-4 text-zinc-600">
                Cada reseña pasa por moderación. Separamos la voz de quien
                alquila de quien delega la gestión, porque los criterios no son
                los mismos.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-700">
                <li className="flex gap-2">
                  <span className="font-semibold text-brand">—</span>
                  Cuenta identificada (Google o email); en la ficha no sale tu
                  correo
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-brand">—</span>
                  Incidencias etiquetadas (fianza, reparaciones, honorarios)
                </li>
              </ul>
              <Link
                href="/metodologia"
                className="link-brand mt-6 inline-block text-sm"
              >
                Leer sobre nuestra metodología
              </Link>
            </div>
            <div className="card-raised relative overflow-hidden p-8">
              <div className="motion-stagger space-y-4">
                {sampleReviews.length === 0 && (
                  <p className="text-sm text-zinc-600">
                    Aún no hay reseñas publicadas. Las primeras experiencias
                    aparecerán aquí tras moderación.
                  </p>
                )}
                {sampleReviews.map((review) => (
                  <div
                    key={`${review.name}-${review.body.slice(0, 24)}`}
                    className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm"
                  >
                    <p className="font-semibold text-zinc-900">
                      {review.name} · {review.role} · {review.rating}/5
                    </p>
                    <p className="mt-1 text-zinc-700">“{review.body}”</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {documented.preview.length > 0 && (
          <section className="mt-16">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Con experiencias publicadas
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  {documented.hidden > 0
                    ? `Las más documentadas. Hay ${documented.total} fichas con reseñas.`
                    : "Todas las fichas que ya tienen reseñas."}
                </p>
              </div>
              <Link href="/agencias" className="link-brand text-sm">
                {documented.hidden > 0
                  ? `Ver las ${documented.total} en el registro`
                  : "Ver el registro"}
              </Link>
            </div>
            <AgencyResultList
              agencies={documented.preview}
              empty="Aún no hay reseñas publicadas."
            />
          </section>
        )}
      </main>

      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            ¿Has tratado con una inmobiliaria?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-300">
            Busca la ficha y deja una reseña verificada. Si falta en el archivo,
            puedes sugerir el alta.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/agencias"
              className="btn-primary inline-flex min-h-11 items-center bg-white px-6 text-zinc-900 hover:bg-zinc-100"
            >
              Buscar y reseñar
            </Link>
            <Link
              href="/agregar-inmobiliaria"
              className="inline-flex min-h-11 items-center rounded-lg border border-zinc-500 px-6 text-sm font-medium text-white transition-[border-color] hover:border-zinc-300"
              style={{ transitionDuration: "var(--duration-fast)" }}
            >
              Sugerir una agencia
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
