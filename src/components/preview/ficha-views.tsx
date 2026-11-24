import { agencyById, reviewsForAgency } from "@/lib/preview/fixtures";
import { reviewsForCityFilter } from "@/lib/preview/reviews";
import type { PreviewController } from "@/components/preview/state";
import {
  CurrentFooter,
  CurrentNav,
  DualScores,
  FictionMark,
  ProposedFooter,
  ProposedNav,
  ReviewExcerpt,
} from "@/components/preview/ui";

export function CurrentFicha({ state }: { state: PreviewController }) {
  const agency = agencyById(state.fichaId);
  const reviews = reviewsForAgency(agency.id);
  const { visible } = reviewsForCityFilter(reviews, state.cityFilter);
  const empty = reviews.length === 0;
  return (
    <div>
      <CurrentNav go={state.go} />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">{agency.name}</h1>
              <FictionMark />
            </div>
            <p className="mt-2 text-sm text-zinc-500">{agency.legalName}</p>
            <p className="mt-3 text-sm text-zinc-700">{agency.cities.join(" · ")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {empty ? (
              <button type="button" className="btn-primary min-h-11" onClick={() => state.openPublish(agency.id)}>
                Dejar la primera reseña
              </button>
            ) : (
              <a href="#experiencias-actuales" className="btn-primary inline-flex min-h-11 items-center justify-center">
                Leer experiencias
              </a>
            )}
            {!empty ? (
              <button type="button" className="link-brand min-h-11 text-sm" onClick={() => state.openPublish(agency.id)}>
                Dejar una reseña
              </button>
            ) : null}
            <span className="text-sm text-zinc-500">Guardar inmobiliaria</span>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Notas de inquilinos y propietarios
          </h2>
          <div className="mt-4">
            <DualScores agencyId={agency.id} />
          </div>
          <CityChips state={state} cities={agency.cities} />
          {empty ? (
            <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="font-medium">Sé la primera persona en contar tu experiencia</p>
              <p className="link-brand mt-2 text-sm">Herramientas para inquilinos</p>
            </div>
          ) : (
            <div id="experiencias-actuales" className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold">Registro de experiencias</h2>
              <p className="text-sm text-zinc-600">
                {visible.length} en esta vista. Si filtras por ciudad, una reseña sin ciudad desaparece sin aviso.
              </p>
              {visible.map((review) => (
                <ReviewExcerpt key={review.id} review={review} />
              ))}
            </div>
          )}
          <div className="mt-10 rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="font-medium">Reclamar esta ficha</h2>
            <p className="mt-2 text-sm text-zinc-600">El formulario de reclamación vive en la misma columna que las experiencias.</p>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="card-raised p-5 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ficha</h2>
            <p className="mt-3 font-medium">{agency.legalName}</p>
            <p className="mt-2 text-zinc-600">Alias guardados, invisibles para el buscador actual: {agency.aliases.join(", ")}.</p>
          </div>
          <button type="button" className="card-interactive w-full p-5 text-left" onClick={() => state.openPublish(agency.id)}>
            <h2 className="font-medium">Escribir reseña</h2>
            <p className="mt-2 text-sm text-zinc-600">Hoy el formulario completo ocupa esta columna, al lado de las notas.</p>
          </button>
        </aside>
      </main>
      <CurrentFooter />
    </div>
  );
}

export function ProposedFicha({ state }: { state: PreviewController }) {
  const agency = agencyById(state.fichaId);
  const reviews = reviewsForAgency(agency.id);
  const { visible, omittedWithoutCity } = reviewsForCityFilter(reviews, state.cityFilter);
  const empty = reviews.length === 0;
  return (
    <div>
      <ProposedNav go={state.go} />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Ficha ficticia</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{agency.name}</h1>
            <FictionMark />
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            {agency.legalName} · {agency.cities.join(" · ")}
          </p>
          <div className="mt-8 max-w-3xl">
            <DualScores agencyId={agency.id} />
          </div>
          <p className="mt-4 max-w-2xl text-sm text-zinc-600">
            Las dos notas son de toda la empresa. La ciudad solo recorta el relato, y solo cuando la experiencia trae ciudad.
          </p>
          {empty ? (
            <div className="mt-8 max-w-2xl rounded-xl border border-stone-200 bg-white p-6">
              <h2 className="text-xl font-semibold tracking-tight">Nadie ha contado todavía esta gestión</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Si alquilaste o encargaste la gestión con {agency.name}, la tuya sería la primera experiencia.
              </p>
              <button
                type="button"
                className="btn-primary mt-5 min-h-12 w-full sm:w-auto"
                onClick={() => state.openPublish(agency.id)}
              >
                Contar la primera experiencia
              </button>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#experiencias" className="btn-secondary inline-flex min-h-11 items-center justify-center">
                Leer experiencias
              </a>
              <button type="button" className="btn-primary min-h-11" onClick={() => state.openPublish(agency.id)}>
                Contar la mía
              </button>
            </div>
          )}
        </div>
      </header>
      {!empty ? (
        <main id="experiencias" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight">Experiencias</h2>
          <CityChips state={state} cities={agency.cities} />
          {state.cityFilter && omittedWithoutCity > 0 ? (
            <p className="mt-4 max-w-2xl rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-zinc-700">
              {omittedWithoutCity === 1
                ? `1 experiencia de esta ficha no tiene ciudad. No entra en ${state.cityFilter} y no la hemos asignado a esa ciudad.`
                : `${omittedWithoutCity} experiencias de esta ficha no tienen ciudad. No entran en ${state.cityFilter} y no las hemos asignado a esa ciudad.`}
            </p>
          ) : null}
          <ul className="mt-6 grid max-w-3xl gap-4">
            {visible.map((review) => (
              <li key={review.id}>
                <ReviewExcerpt review={review} />
              </li>
            ))}
          </ul>
        </main>
      ) : null}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <details className="rounded-xl border border-stone-200 bg-white p-5">
          <summary className="cursor-pointer text-sm font-medium">Datos de la ficha, alias y reclamación</summary>
          <div className="mt-4 space-y-3 text-sm text-zinc-700">
            <p>{agency.legalName}</p>
            <p>Nombres en anuncios: {agency.aliases.join(", ")}.</p>
            <p>Reclamar la ficha y guardarla siguen aquí, fuera de la lectura de las notas.</p>
          </div>
        </details>
      </section>
      <ProposedFooter />
    </div>
  );
}

function CityChips({
  state,
  cities,
}: {
  state: PreviewController;
  cities: string[];
}) {
  if (cities.length < 2) return null;
  const chips = [null, ...cities];
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {chips.map((city) => {
        const active = state.cityFilter === city;
        return (
          <button
            key={city ?? "todas"}
            type="button"
            className={`filter-chip min-h-11 ${active ? "filter-chip-active" : "filter-chip-idle"}`}
            onClick={() => state.setCityFilter(city)}
          >
            {city ?? "Todas las ciudades"}
          </button>
        );
      })}
    </div>
  );
}
