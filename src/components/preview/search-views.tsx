import { useState } from "react";

import { PREVIEW_AGENCIES } from "@/lib/preview/fixtures";
import {
  searchCurrent,
  searchProposed,
  sortAgencies,
  type PreviewHit,
  type PreviewSort,
} from "@/lib/preview/search";
import type { PreviewController } from "@/components/preview/state";
import {
  CurrentFooter,
  CurrentNav,
  DualScores,
  FictionMark,
  ProposedFooter,
  ProposedNav,
} from "@/components/preview/ui";

const CURRENT_SORTS: { id: PreviewSort; label: string }[] = [
  { id: "reviews", label: "Más reseñas" },
  { id: "inquilino", label: "Nota inquilinos" },
  { id: "propietario", label: "Nota propietarios" },
  { id: "overall", label: "Nota media" },
  { id: "name", label: "Nombre" },
];

const PROPOSED_SORTS = CURRENT_SORTS.filter((option) => option.id !== "overall");

function matchLine(hit: PreviewHit) {
  if (hit.via === "alias") return `Coincide con el alias «${hit.matchedOn}».`;
  if (hit.via === "ciudad") return `Está en ${hit.matchedOn}.`;
  if (hit.matchedOn !== hit.agency.name) return `Coincide con «${hit.matchedOn}».`;
  return hit.agency.cities.join(" · ");
}

export function AgencyChoice({
  hit,
  state,
}: {
  hit: PreviewHit;
  state: PreviewController;
}) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{hit.agency.name}</h3>
        <FictionMark />
      </div>
      <p className="mt-1 text-sm text-zinc-600">{matchLine(hit)}</p>
      <p className="mt-1 text-sm text-zinc-500">{hit.agency.legalName}</p>
      <div className="mt-4">
        <DualScores agencyId={hit.agency.id} />
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-secondary min-h-11" onClick={() => state.openFicha(hit.agency.id)}>
          Ver la ficha
        </button>
        <button type="button" className="btn-primary min-h-11" onClick={() => state.openPublish(hit.agency.id)}>
          Contar experiencia
        </button>
      </div>
    </article>
  );
}

export function CurrentSearch({ state }: { state: PreviewController }) {
  const [sort, setSort] = useState<PreviewSort>("reviews");
  const found = sortAgencies(searchCurrent(state.query), sort);
  return (
    <div>
      <CurrentNav go={state.go} />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Registro público</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Registro de inmobiliarias</h1>
          <p className="mt-3 max-w-2xl text-zinc-600">
            El buscador de hoy mira el nombre canónico y la ciudad. Los alias no entran.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <SearchField id="current-q" state={state} placeholder="Nombre de la agencia o ciudad…" />
        <div className="flex flex-wrap gap-2">
          {CURRENT_SORTS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`filter-chip min-h-11 ${sort === option.id ? "filter-chip-active" : "filter-chip-idle"}`}
              onClick={() => setSort(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          {found.length} {found.length === 1 ? "agencia" : "agencias"}
          {state.query.trim() ? ` para «${state.query.trim()}»` : ""}
        </p>
        {found.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-zinc-700">
            No hay resultados. El siguiente paso, hoy, es sugerir un alta. No se comprueban los alias.
          </div>
        ) : (
          <ul className="grid gap-4">
            {found.map((agency) => (
              <li key={agency.id}>
                <AgencyChoice
                  state={state}
                  hit={{ agency, matchedOn: agency.name, via: "nombre", confidence: 1 }}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
      <CurrentFooter />
    </div>
  );
}

export function ProposedSearch({ state }: { state: PreviewController }) {
  const [sort, setSort] = useState<PreviewSort>("reviews");
  const trimmed = state.query.trim();
  const result = searchProposed(trimmed);
  const hits = trimmed
    ? result.hits
    : sortAgencies(PREVIEW_AGENCIES, sort).map((agency) => ({
        agency,
        matchedOn: agency.name,
        via: "nombre" as const,
        confidence: 1,
      }));
  return (
    <div>
      <ProposedNav go={state.go} />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Buscador</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Buscar una inmobiliaria</h1>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Nombre, alias o ciudad. Si dos fichas se parecen, se muestran las dos.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <SearchField id="proposed-q" state={state} placeholder="Nombre, alias o ciudad" />
        <div className="flex flex-wrap gap-2">
          {PROPOSED_SORTS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`filter-chip min-h-11 ${sort === option.id ? "filter-chip-active" : "filter-chip-idle"}`}
              onClick={() => setSort(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {result.ambiguous ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Hay {hits.length} fichas posibles para «{trimmed}». No las hemos unido: pueden ser empresas distintas.
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            {hits.length} {hits.length === 1 ? "ficha" : "fichas"}
            {trimmed ? ` para «${trimmed}»` : " en el archivo de ejemplo"}
          </p>
        )}
        {hits.length === 0 ? (
          <EmptyProposed query={trimmed} onWrite={() => state.openPublish(null)} />
        ) : (
          <ul className="grid gap-4">
            {hits.map((hit) => (
              <li key={hit.agency.id}>
                <AgencyChoice hit={hit} state={state} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <ProposedFooter />
    </div>
  );
}

function EmptyProposed({ query, onWrite }: { query: string; onWrite: () => void }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold">
        {query ? `«${query}» no está en el archivo de ejemplo` : "Escribe un nombre"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Tampoco coincide con un alias. Puedes contar la experiencia y, si confirmas que no es ninguna ficha parecida, saldría una ficha provisional.
      </p>
      <button type="button" className="btn-primary mt-4 min-h-11" onClick={onWrite}>
        Contar la experiencia
      </button>
    </div>
  );
}

function SearchField({
  id,
  state,
  placeholder,
}: {
  id: string;
  state: PreviewController;
  placeholder: string;
}) {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="max-w-xl"
    >
      <label className="sr-only" htmlFor={id}>
        Buscar
      </label>
      <input
        id={id}
        value={state.query}
        onChange={(event) => state.setQuery(event.target.value)}
        placeholder={placeholder}
        className="input-field min-h-12"
      />
    </form>
  );
}
