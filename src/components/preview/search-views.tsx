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

function matchLine(hit: PreviewHit, listing: boolean) {
  if (listing) return hit.agency.cities.join(" · ");
  if (hit.band === "ciudad") return `Está en ${hit.matchedOn}. No identifica el nombre.`;
  if (hit.band === "exacta" && hit.via === "alias") {
    return `El alias «${hit.matchedOn}» coincide. No se abre otra ficha ni se asigna sola.`;
  }
  if (hit.band === "exacta") return `El nombre coincide con «${hit.matchedOn}». Hay que elegirla.`;
  if (hit.band === "probable") return `Se parece a «${hit.matchedOn}». No basta para darla por la misma.`;
  return `Parecido con «${hit.matchedOn}». El 0,45 solo avisa, no identifica.`;
}

export function AgencyChoice({
  hit,
  state,
  listing = false,
}: {
  hit: PreviewHit;
  state: PreviewController;
  listing?: boolean;
}) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold">{hit.agency.name}</h3>
        <FictionMark />
      </div>
      <p className="mt-1 text-sm text-zinc-600">{matchLine(hit, listing)}</p>
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
                  hit={{ agency, matchedOn: agency.name, via: "nombre", confidence: 1, band: "exacta" }}
                  listing
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
  const directory = sortAgencies(PREVIEW_AGENCIES, sort).map((agency) => ({
    agency,
    matchedOn: agency.name,
    via: "nombre" as const,
    confidence: 1,
    band: "exacta" as const,
  }));
  return (
    <div>
      <ProposedNav go={state.go} />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Buscador</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Buscar una inmobiliaria</h1>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Nombre, alias o ciudad. Una coincidencia exacta o probable se enseña para elegirla. El 0,45 solo avisa de un parecido.
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
        {!trimmed ? (
          <p className="text-sm text-zinc-500">{directory.length} fichas en el archivo de ejemplo</p>
        ) : result.ambiguous ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Hay {result.identified.length} fichas posibles para «{trimmed}». No las hemos unido ni elegido una.
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            {result.identified.length} {result.identified.length === 1 ? "identificación posible" : "identificaciones posibles"} para «{trimmed}»
          </p>
        )}
        {!trimmed ? (
          <ul className="grid gap-4">
            {directory.map((hit) => (
              <li key={hit.agency.id}>
                <AgencyChoice hit={hit} state={state} listing />
              </li>
            ))}
          </ul>
        ) : (
          <>
            {result.identified.length > 0 ? (
              <ul className="grid gap-4">
                {result.identified.map((hit) => (
                  <li key={hit.agency.id}>
                    <AgencyChoice hit={hit} state={state} />
                  </li>
                ))}
              </ul>
            ) : null}
            {result.cityHits.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600">Estas fichas están en esa ciudad. El nombre no ha quedado identificado.</p>
                <ul className="grid gap-4">
                  {result.cityHits.map((hit) => (
                    <li key={hit.agency.id}>
                      <AgencyChoice hit={hit} state={state} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {result.hints.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600">Parecidos por debajo de una identificación. No bloquean otra ficha.</p>
                <ul className="grid gap-4">
                  {result.hints.map((hit) => (
                    <li key={hit.agency.id}>
                      <AgencyChoice hit={hit} state={state} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {result.identified.length === 0 && result.cityHits.length === 0 && result.hints.length === 0 ? (
              <EmptyProposed query={trimmed} onWrite={() => state.openPublish(null)} />
            ) : null}
          </>
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
