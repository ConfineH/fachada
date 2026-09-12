import Link from "next/link";
import { notFound } from "next/navigation";

import { AgencyBrowseControls } from "@/components/agency-browse-controls";
import { AgencyResultList } from "@/components/agency-result-list";
import { CityPhoto } from "@/components/city-photo";
import { PublicShell } from "@/components/public-shell";
import { parseAgencySort } from "@/lib/domain/agency-browse";
import { slugToCityLabel } from "@/lib/domain/city";
import { agencyService, usingSupabase } from "@/lib/container";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const label = slugToCityLabel(city);
  return {
    title: `Inmobiliarias en ${label} — reseñas Fachada`,
    description: `Opiniones de inquilinos y propietarios sobre inmobiliarias en ${label}.`,
  };
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
          <Link href="/explorar" className="text-sm text-white/80 underline-offset-2 hover:underline">
            ← Explorar ciudades
          </Link>
          <h1 className="motion-fade-rise mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Inmobiliarias en {label}
          </h1>
          <p className="mt-2 text-white/80">
            {listed.length}{" "}
            {listed.length === 1 ? "agencia" : "agencias"} en el registro de
            esta ciudad.
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
