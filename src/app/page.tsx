import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { RoleRatingSummary } from "@/components/role-rating-summary";
import { SearchForm } from "@/components/search-form";
import { agencyService, usingSupabase } from "@/lib/container";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const agencies = await agencyService.search(q, { publicOnly: true });
  const cities = await agencyService.exploreCities({ publicOnly: true });
  const totalAgencies = cities.reduce((sum, c) => sum + c.agencyCount, 0);
  const totalReviews = cities.reduce((sum, c) => sum + c.reviewCount, 0);
  const featuredCities = [...cities]
    .sort((a, b) => b.agencyCount - a.agencyCount)
    .slice(0, 5);
  const sampleAgencies = agencies.filter((a) => a.reviewCount > 0).slice(0, 3);
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
              <SearchForm variant="hero" initialQuery={q ?? ""} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-14">
        {!q && featuredCities.length > 0 && (
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
                    className={index === 0 ? "lg:row-span-2" : ""}
                  >
                    <Link
                      href={`/ciudades/${city.slug}`}
                      className={`card-interactive flex h-full flex-col justify-end p-6 ${
                        index === 0
                          ? "min-h-[220px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 text-white lg:min-h-[320px]"
                          : ""
                      }`}
                    >
                      <p
                        className={
                          index === 0
                            ? "text-xs font-semibold uppercase tracking-wider text-zinc-300"
                            : "text-xs font-semibold uppercase tracking-wider text-zinc-500"
                        }
                      >
                        {index === 0 ? "Capital" : "Ciudad"}
                      </p>
                      <h3
                        className={`mt-1 font-semibold tracking-tight ${
                          index === 0 ? "text-3xl" : "text-xl"
                        }`}
                      >
                        {city.city}
                      </h3>
                      <p
                        className={`mt-2 text-sm ${
                          index === 0 ? "text-zinc-300" : "text-zinc-600"
                        }`}
                      >
                        {city.agencyCount} agencias · {city.reviewCount} reseñas
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        <Reveal className={q ? "" : "mt-20"}>
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
                  Teléfono verificado por SMS; en público no mostramos el número
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

        <Reveal className="mt-16">
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                {q ? `Resultados para «${q}»` : "Inmobiliarias en el registro"}
              </h2>
              <span className="text-sm text-zinc-500">
                {agencies.length} resultados
              </span>
            </div>

            <ul className="motion-stagger grid gap-4">
              {agencies.length === 0 && (
                <li className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-zinc-600">
                  No hay resultados.{" "}
                  <Link href="/agregar-inmobiliaria" className="link-brand">
                    Sugerir una inmobiliaria
                  </Link>{" "}
                  que aún no esté en Fachada.
                </li>
              )}
              {agencies.map((agency) => (
                <li key={agency.id}>
                  <Link
                    href={`/agencias/${agency.slug}`}
                    className="card-interactive block p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{agency.name}</h3>
                        <p className="text-sm text-zinc-600">
                          {agency.address}, {agency.city}
                        </p>
                      </div>
                      <div className="min-w-[240px]">
                        <RoleRatingSummary roleRatings={agency.roleRatings} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
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
              href="/explorar"
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
