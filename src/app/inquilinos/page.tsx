import Link from "next/link";

import { AgencyResultList } from "@/components/agency-result-list";
import { PromoVisitBeacon } from "@/components/promo-visit-beacon";
import { PublicShell } from "@/components/public-shell";
import { TENANT_TOOLS } from "@/lib/domain/tools/catalog";
import { promoQuery, readUtmValue } from "@/lib/domain/promo-utm";
import { agencyService, usingSupabase } from "@/lib/container";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Buscar una inmobiliaria",
  "Busca por nombre, alias o ciudad y cuenta cómo te fue. Las calculadoras del alquiler siguen aquí, después.",
  "/inquilinos",
);

export default async function InquilinosPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    utm_source?: string;
    utm_campaign?: string;
  }>;
}) {
  const params = await searchParams;
  const utm = {
    source: readUtmValue(params.utm_source),
    campaign: readUtmValue(params.utm_campaign),
  };
  const query = params.q?.trim() ?? "";
  const kept = promoQuery(utm);
  const agencies = query
    ? await agencyService.search(query, { publicOnly: true })
    : [];
  const cityOnly = query ? await agencyService.namesACity(query) : false;

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      {!query && (utm.source || utm.campaign) ? (
        <PromoVisitBeacon source={utm.source} campaign={utm.campaign} />
      ) : null}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Archivo público
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
          Buscar una inmobiliaria
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600">
          Nombre, alias o ciudad. Una coincidencia exacta o probable se enseña
          para elegirla. Un parecido débil no identifica la ficha.
        </p>

        <section id="buscar" className="mt-8">
          <form action="/inquilinos" method="get" className="mt-4 flex flex-col gap-2">
            {utm.source ? (
              <input type="hidden" name="utm_source" value={utm.source} />
            ) : null}
            {utm.campaign ? (
              <input type="hidden" name="utm_campaign" value={utm.campaign} />
            ) : null}
            <label className="sr-only" htmlFor="inquilinos-q">
              Nombre de la inmobiliaria
            </label>
            <input
              id="inquilinos-q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Nombre, alias o ciudad"
              className="input-field min-h-12 text-base"
            />
            <button type="submit" className="btn-primary min-h-12 text-base">
              Buscar
            </button>
          </form>

          {query ? (
            <div className="mt-6 space-y-4">
              <AgencyResultList
                agencies={agencies}
                hrefFor={(agency) =>
                  `/agencias/${agency.slug}${kept}#dejar-resena`
                }
                empty={
                  cityOnly ? (
                    <p>
                      «{query}» es una ciudad del archivo, no el nombre de una
                      inmobiliaria. Busca el nombre comercial.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p>No hay una ficha con «{query}».</p>
                      <Link
                        href={`/inquilinos/anadir${promoQuery(utm, { nombre: query })}`}
                        className="btn-primary inline-flex min-h-12 items-center justify-center px-4"
                      >
                        Si no está, añádela y escribe tu reseña
                      </Link>
                    </div>
                  )
                }
              />
              {agencies.length > 0 && !cityOnly ? (
                <p className="text-sm text-zinc-600">
                  ¿No es ninguna de estas?{" "}
                  <Link
                    href={`/inquilinos/anadir${promoQuery(utm, { nombre: query })}`}
                    className="link-brand"
                  >
                    Si no está, añádela y escribe tu reseña
                  </Link>
                  .
                </p>
              ) : null}
              {agencies.length > 0 && cityOnly ? (
                <p className="text-sm text-zinc-600">
                  «{query}» es una ciudad. Estas son fichas que trabajan ahí. Para
                  una ficha nueva hace falta el nombre comercial, no la ciudad.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-600">
              Si no está,{" "}
              <Link
                href={`/inquilinos/anadir${kept}`}
                className="link-brand"
              >
                añádela y escribe tu reseña
              </Link>
              . La ficha sale al momento, marcada como provisional.
            </p>
          )}
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Calculadoras del alquiler
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Seis cálculos en el móvil, sin cuenta. No sustituyen la reputación
            de la inmobiliaria.
          </p>
          <ul className="mt-6 grid gap-3">
            {TENANT_TOOLS.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={`${tool.path}${kept}`}
                  className="card-interactive block p-4"
                >
                  <h3 className="text-lg font-semibold tracking-tight">
                    {tool.label}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {tool.card}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PublicShell>
  );
}
