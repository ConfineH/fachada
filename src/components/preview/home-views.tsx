import {
  PREVIEW_AGENCIES,
  PREVIEW_REVIEWS,
  agencyById,
} from "@/lib/preview/fixtures";
import { reviewsOf } from "@/lib/preview/search";
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

const TOOLS = [
  "Honorarios de agencia",
  "Reclamar la fianza",
  "Reparaciones",
  "Salir antes del contrato",
  "Acta de entrega de llaves",
  "Subida del alquiler",
];

export function CurrentHome({ state }: { state: PreviewController }) {
  const documented = PREVIEW_AGENCIES.filter((agency) => reviewsOf(agency.id).length > 0);
  return (
    <div>
      <CurrentNav go={state.go} />
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Archivo público independiente
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Antes de firmar, mira la reputación de esa inmobiliaria
            </h1>
            <p className="mt-4 text-zinc-600">
              Inquilinos y propietarios cuentan cómo ha sido la gestión del alquiler.
            </p>
          </div>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              state.go("buscar");
            }}
          >
            <label className="sr-only" htmlFor="current-home-q">
              Nombre de la agencia o ciudad
            </label>
            <input
              id="current-home-q"
              value={state.query}
              onChange={(event) => state.setQuery(event.target.value)}
              placeholder="Nombre de la agencia o ciudad…"
              className="input-field min-h-11 flex-1"
            />
            <button type="submit" className="btn-primary min-h-11">
              Buscar
            </button>
          </form>
        </div>
      </section>
      <main className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Fichas con reseñas</h2>
          <ul className="mt-4 grid gap-4">
            {documented.map((agency) => (
              <li key={agency.id}>
                <button
                  type="button"
                  onClick={() => state.openFicha(agency.id)}
                  className="card-interactive block w-full p-5 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{agency.name}</h3>
                    <FictionMark />
                  </div>
                  <p className="text-sm text-zinc-600">{agency.cities.join(" · ")}</p>
                  <div className="mt-4">
                    <DualScores agencyId={agency.id} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Ciudades destacadas</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {["Madrid", "Sevilla", "Barcelona"].map((city) => (
              <li key={city}>
                <button
                  type="button"
                  className="card-interactive w-full p-5 text-left"
                  onClick={() => {
                    state.setQuery(city);
                    state.go("buscar");
                  }}
                >
                  <span className="text-lg font-semibold">{city}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">
            Herramientas para un problema concreto
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <li key={tool} className="rounded-xl border border-stone-200 bg-white p-5">
                <h3 className="font-semibold">{tool}</h3>
                <p className="mt-1 text-sm text-zinc-500">En el producto abre la calculadora.</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">
          <h2 className="text-2xl font-semibold">¿Has alquilado o encargado la gestión?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-secondary min-h-11 bg-white" onClick={() => state.go("buscar")}>
              Buscar una inmobiliaria
            </button>
            <span className="inline-flex min-h-11 items-center rounded-lg border border-zinc-500 px-5 text-sm">
              Sugerir una agencia
            </span>
          </div>
        </div>
      </section>
      <CurrentFooter />
    </div>
  );
}

export function ProposedHome({ state }: { state: PreviewController }) {
  const samples = PREVIEW_REVIEWS.filter((review) =>
    ["r-norte-1", "r-sur-2", "r-sur-3"].includes(review.id),
  );
  return (
    <div>
      <ProposedNav go={state.go} />
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Archivo público
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Antes de firmar, mira cómo gestionan el alquiler
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600">
            Dos notas, la de inquilinos y la de propietarios. La inmobiliaria es una sola ficha.
          </p>
          <form
            className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              state.go("buscar");
            }}
          >
            <label className="sr-only" htmlFor="proposed-home-q">
              Nombre, alias o ciudad
            </label>
            <input
              id="proposed-home-q"
              value={state.query}
              onChange={(event) => state.setQuery(event.target.value)}
              placeholder="Nombre, alias o ciudad"
              className="input-field min-h-12 flex-1"
            />
            <button type="submit" className="btn-primary min-h-12">
              Buscar
            </button>
            <button
              type="button"
              className="btn-secondary min-h-12"
              onClick={() => state.openPublish(null)}
            >
              Contar una experiencia
            </button>
          </form>
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Experiencias publicadas</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Cada texto lleva a su ficha. Si no consta la ciudad, no se rellena con la de la empresa.
        </p>
        <ul className="mt-6 grid gap-4 lg:grid-cols-3">
          {samples.map((review) => (
            <li key={review.id}>
              <p className="mb-2 text-sm font-medium text-zinc-500">
                {agencyById(review.agencyId).name}
              </p>
              <ReviewExcerpt review={review} onOpen={() => state.openFicha(review.agencyId)} />
            </li>
          ))}
        </ul>
      </main>
      <ProposedFooter />
    </div>
  );
}
