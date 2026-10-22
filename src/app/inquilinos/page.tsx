import Link from "next/link";

import { AgencyResultList } from "@/components/agency-result-list";
import { PromoVisitBeacon } from "@/components/promo-visit-beacon";
import { PublicShell } from "@/components/public-shell";
import { TENANT_TOOLS } from "@/lib/domain/tools/catalog";
import { promoQuery, readUtmValue } from "@/lib/domain/promo-utm";
import { agencyService, usingSupabase } from "@/lib/container";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Para inquilinos",
  "Herramientas gratuitas para el alquiler y un sitio para contar cómo te fue con la inmobiliaria.",
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

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      {!query && (utm.source || utm.campaign) ? (
        <PromoVisitBeacon source={utm.source} campaign={utm.campaign} />
      ) : null}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Gratis, para inquilinos
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
          Herramientas para el alquiler
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-600">
          Seis cálculos que puedes usar en el móvil, sin cuenta. Si el problema
          fue con una inmobiliaria, más abajo puedes buscarla y contarlo.
        </p>

        <ul className="mt-8 grid gap-3">
          {TENANT_TOOLS.map((tool) => (
            <li key={tool.id}>
              <Link
                href={`${tool.path}${kept}`}
                className="card-interactive block p-4"
              >
                <h2 className="text-lg font-semibold tracking-tight">
                  {tool.label}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  {tool.card}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <section id="buscar" className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Busca tu inmobiliaria y cuenta cómo te fue
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            El nombre que escribes se busca en el archivo. Si no está, puedes
            añadirla y escribir la reseña en el mismo paso.
          </p>
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
              placeholder="Nombre de la inmobiliaria"
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
                  <div className="space-y-3">
                    <p>No hay una ficha con «{query}».</p>
                    <Link
                      href={`/inquilinos/anadir${promoQuery(utm, { nombre: query })}`}
                      className="btn-primary inline-flex min-h-12 items-center justify-center px-4"
                    >
                      Si no está, añádela y escribe tu reseña
                    </Link>
                  </div>
                }
              />
              {agencies.length > 0 ? (
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
      </main>
    </PublicShell>
  );
}
