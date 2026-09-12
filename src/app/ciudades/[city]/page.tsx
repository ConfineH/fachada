import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { AgencyBrowseControls } from "@/components/agency-browse-controls";
import { AgencyResultList } from "@/components/agency-result-list";
import { CityPhoto } from "@/components/city-photo";
import { PublicShell } from "@/components/public-shell";
import { parseAgencySort } from "@/lib/domain/agency-browse";
import { slugToCityLabel } from "@/lib/domain/city";
import { agencyService, usingSupabase } from "@/lib/container";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const label = slugToCityLabel(city);
  return pageMeta(
    `Inmobiliarias en ${label}: gestión de alquiler`,
    `Fichas de inmobiliarias en ${label} y experiencias de inquilinos y propietarios sobre fianzas, reparaciones y honorarios.`,
    `/ciudades/${city}`,
  );
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ q?: string; orden?: string }>;
}) {
  const { city } = await params;
  const { q, orden } = await searchParams;
  const sort = parseAgencySort(orden);
  const query = q?.trim() ?? "";
  const listed = await agencyService.listByCity(city, {
    publicOnly: true,
    sort,
  });
  if (listed.length === 0) notFound();

  const agencies = query
    ? listed.filter((agency) =>
        agency.name.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")),
      )
    : listed;
  const label = listed[0]?.city ?? slugToCityLabel(city);

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <header className="relative min-h-[220px] overflow-hidden border-b border-stone-200">
        <CityPhoto slug={city} city={label} priority sizes="100vw" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6 py-16 text-white">
          <div className="text-white/80 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white">
            <Breadcrumbs
              items={[
                { name: "Ciudades", href: "/explorar" },
                { name: label, href: `/ciudades/${city}` },
              ]}
            />
          </div>
          <h1 className="motion-fade-rise mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Inmobiliarias en {label}
          </h1>
          <p className="mt-2 text-white/80">
            {listed.length}{" "}
            {listed.length === 1 ? "ficha" : "fichas"} en el archivo de esta
            ciudad. Las notas van en cada inmobiliaria.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <AgencyBrowseControls
          action={`/ciudades/${city}`}
          query={query}
          sort={sort}
        />
        <AgencyResultList
          agencies={agencies}
          empty={
            query
              ? `Ninguna inmobiliaria en ${label} coincide con «${query}».`
              : `Aún no hay inmobiliarias en ${label}.`
          }
        />
      </main>
    </PublicShell>
  );
}
