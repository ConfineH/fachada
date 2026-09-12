import Link from "next/link";

import { AgencyBrowseControls } from "@/components/agency-browse-controls";
import { AgencyResultList } from "@/components/agency-result-list";
import { PublicShell } from "@/components/public-shell";
import { parseAgencySort } from "@/lib/domain/agency-browse";
import { agencyService, usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Registro de inmobiliarias — Fachada",
  description:
    "Busca inmobiliarias en España y ordénalas por reseñas o por la nota de inquilinos y propietarios.",
};

export default async function AgencyRegistryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; orden?: string }>;
}) {
  const { q, orden } = await searchParams;
  const sort = parseAgencySort(orden);
  const query = q?.trim() ?? "";
  const agencies = await agencyService.search(query || undefined, {
    publicOnly: true,
    sort,
  });

  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Registro público
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Inmobiliarias
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Orden por defecto: las que más reseñas tienen. Una nota alta con una
            sola experiencia no va delante de una ficha más documentada.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <AgencyBrowseControls
          action="/agencias"
          query={query}
          sort={sort}
          placeholder="Nombre de la agencia o ciudad…"
        />
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-sm font-medium text-zinc-500">
            {query
              ? `Resultados para «${query}»`
              : "Todas las fichas del archivo"}
          </h2>
          <span className="text-sm text-zinc-500">
            {agencies.length} {agencies.length === 1 ? "agencia" : "agencias"}
          </span>
        </div>
        <AgencyResultList
          agencies={agencies}
          empty={
            <>
              No hay resultados.{" "}
              <Link href="/agregar-inmobiliaria" className="link-brand">
                Sugerir una inmobiliaria
              </Link>{" "}
              que aún no esté en Fachada.
            </>
          }
        />
      </main>
    </PublicShell>
  );
}
