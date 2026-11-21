"use client";

import { useState } from "react";

import { AUTHENTICITY_LABELS, mapOptionalSides, publicBodyFromSides } from "@/lib/preview/narrative";
import { agencyById } from "@/lib/preview/fixtures";
import { provisionalCandidates, searchProposed } from "@/lib/preview/search";
import type { PreviewController } from "@/components/preview/state";
import { AgencyChoice } from "@/components/preview/search-views";
import {
  CurrentFooter,
  CurrentNav,
  ProposedFooter,
  ProposedNav,
} from "@/components/preview/ui";

export function CurrentPublish({ state }: { state: PreviewController }) {
  const agency = agencyById(state.publishAgencyId ?? state.fichaId);
  return (
    <div>
      <CurrentNav go={state.go} />
      <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Dentro de la ficha</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Escribir reseña</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Sobre {agency.name}. Hoy ventajas y desventajas son obligatorias a la vez. La nota es un campo numérico.
          {state.formMode === "alternativa"
            ? " El modo de un solo lado no existe aquí: sigue haciendo falta escribir los dos."
            : ""}
        </p>
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
          {state.result ? (
            <CurrentEnding state={state} agencyName={agency.name} />
          ) : (
            <div className="space-y-4">
              <Field label="Tu papel" value="Inquilino" />
              <Field label="Último contacto" value="Fecha" />
              <Field label="Nota (1–5)" value="4" />
              <Field label="Desventajas, obligatorias" value="Qué falló" />
              <Field label="Ventajas, obligatorias" value="Qué funcionó" />
              <p className="text-xs text-zinc-500">Cuatro declaraciones de autenticidad y un archivo opcional, al final del mismo bloque.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" className="btn-primary min-h-11" onClick={() => state.setResult("inmediata")}>
                  Simular publicación inmediata
                </button>
                <button type="button" className="btn-secondary min-h-11" onClick={() => state.setResult("pendiente")}>
                  Simular revisión
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <CurrentFooter />
    </div>
  );
}

function CurrentEnding({
  state,
  agencyName,
}: {
  state: PreviewController;
  agencyName: string;
}) {
  const published = state.result === "inmediata";
  return (
    <div className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
      <p className="font-medium">Reseña enviada</p>
      <p className="mt-1">
        {published
          ? "Ya está en la ficha como experiencia declarada."
          : "No se ha publicado. Queda en revisión humana. Puedes ver el estado en tu cuenta."}
      </p>
      <button type="button" className="mt-3 font-medium underline" onClick={() => state.openFicha(state.publishAgencyId ?? state.fichaId)}>
        Ver la ficha de {agencyName}
      </button>
      <button type="button" className="mt-3 block text-emerald-800 underline" onClick={() => state.setResult(null)}>
        Volver al formulario
      </button>
    </div>
  );
}

export function ProposedPublish({ state }: { state: PreviewController }) {
  const [rejected, setRejected] = useState(false);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [rating, setRating] = useState<number | null>(4);
  const [checks, setChecks] = useState([false, false, false, false]);
  const agency = state.publishAgencyId ? agencyById(state.publishAgencyId) : null;
  const mapped = mapOptionalSides({ pros, cons });
  const declarationsReady = checks.every(Boolean);
  const conservativeReady = pros.trim().length >= 10 && cons.trim().length >= 10 && declarationsReady && rating !== null;
  const alternativeReady = mapped.publishable && declarationsReady && rating !== null;

  return (
    <div>
      <ProposedNav go={state.go} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Publicar</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Contar una experiencia</h1>
        {state.result ? (
          agency ? (
            <ProposedEnding state={state} agencyId={agency.id} agencyName={agency.name} />
          ) : (
            <ProvisionalEnding state={state} />
          )
        ) : agency ? (
          <form
            className="mt-8 space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              state.setResult("inmediata");
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-700">
                Vas a escribir sobre <span className="font-semibold">{agency.name}</span>.
              </p>
              <button
                type="button"
                className="text-sm font-medium text-brand"
                onClick={() => state.openPublish(null)}
              >
                Cambiar de ficha
              </button>
            </div>
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold">Qué pasó</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-zinc-600">
                  Tu papel
                  <select className="input-field mt-1" defaultValue="inquilino">
                    <option value="inquilino">Inquilino</option>
                    <option value="propietario">Propietario</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  Ciudad del piso
                  <input className="input-field mt-1" placeholder={agency.cities[0]} list="publish-cities" />
                  <datalist id="publish-cities">
                    {agency.cities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </label>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-600">Nota</p>
                <div className="mt-2 flex gap-2" role="group" aria-label="Nota de 1 a 5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`filter-chip min-h-11 min-w-11 ${rating === value ? "filter-chip-active" : "filter-chip-idle"}`}
                      onClick={() => setRating(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              {state.formMode === "conservador" ? (
                <>
                  <TextSide label="Desventajas, obligatorias" value={cons} onChange={setCons} />
                  <TextSide label="Ventajas, obligatorias" value={pros} onChange={setPros} />
                  <p className="text-sm text-zinc-600">Este es el contrato actual: sin los dos textos, no se publica.</p>
                </>
              ) : (
                <>
                  <TextSide label="Qué falló" value={cons} onChange={setCons} />
                  <TextSide label="Qué funcionó" value={pros} onChange={setPros} />
                  <p className="text-sm text-zinc-600">Basta con un lado. El otro puede quedar vacío. No se inventa el texto que falta.</p>
                  <StoragePreview pros={pros} cons={cons} />
                </>
              )}
            </fieldset>
            <fieldset className="space-y-2 rounded-xl border border-stone-200 p-4">
              <legend className="px-1 text-sm font-semibold">Declaraciones de autenticidad</legend>
              {AUTHENTICITY_LABELS.map((label, index) => (
                <label key={label} className="flex items-start gap-2 text-sm text-zinc-800">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checks[index]}
                    onChange={(event) =>
                      setChecks((current) => current.map((item, itemIndex) => (itemIndex === index ? event.target.checked : item)))
                    }
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <p className="text-sm text-zinc-600">
              {state.formMode === "conservador"
                ? conservativeReady
                  ? "Con lo escrito y las declaraciones, este envío podría salir."
                  : "Tal como está el modelo actual, aún faltaría un lado o una declaración."
                : alternativeReady
                  ? "Con un lado y las declaraciones, este envío podría salir."
                  : "Aún falta un lado de al menos 10 caracteres o una declaración."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="submit" className="btn-primary min-h-12">
                Simular publicación inmediata
              </button>
              <button type="button" className="btn-secondary min-h-12" onClick={() => state.setResult("pendiente")}>
                Simular revisión
              </button>
            </div>
          </form>
        ) : (
          <AgencyPicker state={state} rejected={rejected} onReject={setRejected} />
        )}
      </main>
      <ProposedFooter />
    </div>
  );
}

function AgencyPicker({
  state,
  rejected,
  onReject,
}: {
  state: PreviewController;
  rejected: boolean;
  onReject: (value: boolean) => void;
}) {
  const trimmed = state.query.trim();
  const { hits, ambiguous } = trimmed ? searchProposed(trimmed) : { hits: [], ambiguous: false };
  const candidates = provisionalCandidates(trimmed);
  return (
    <div className="mt-8 space-y-6">
      <p className="text-sm leading-relaxed text-zinc-600">
        Primero localiza la inmobiliaria. Si el nombre del anuncio ya es un alias, escribes en esa ficha.
      </p>
      <label className="block text-sm font-medium" htmlFor="publish-q">
        Nombre, alias o ciudad
        <input
          id="publish-q"
          value={state.query}
          onChange={(event) => {
            onReject(false);
            state.setQuery(event.target.value);
          }}
          className="input-field mt-2 min-h-12 font-normal"
          placeholder="Por ejemplo, NorteLlaves o Patio Sur"
        />
      </label>
      {ambiguous ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Hay más de una ficha posible. No las hemos unido. Elige una.
        </p>
      ) : null}
      <ul className="grid gap-4">
        {hits.map((hit) => (
          <li key={hit.agency.id}>
            <AgencyChoice hit={hit} state={state} />
          </li>
        ))}
      </ul>
      {trimmed.length >= 2 && candidates.length > 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">¿Ninguna es la tuya?</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Antes de una ficha provisional hay que descartar estas coincidencias. No se fusionan solas.
          </p>
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={rejected} onChange={(event) => onReject(event.target.checked)} />
            No es ninguna de estas fichas.
          </label>
          {rejected ? (
            <div className="mt-4">
              <p className="text-sm text-zinc-700">
                La ficha de «{trimmed}» saldría como provisional, pendiente de verificar, y la experiencia iría en ella.
              </p>
              <button type="button" className="btn-primary mt-3 min-h-11" onClick={() => state.setResult("pendiente")}>
                Simular alta provisional en revisión
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {trimmed.length >= 2 && candidates.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">No hay una ficha ni un alias parecido</h2>
          <p className="mt-2 text-sm text-zinc-600">
            «{trimmed}» puede crearse como ficha provisional. No hay otra entidad con la que confundirla.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function TextSide({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-medium text-zinc-600">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="input-field mt-1 font-normal" />
    </label>
  );
}

function StoragePreview({ pros, cons }: { pros: string; cons: string }) {
  const mapped = mapOptionalSides({ pros, cons });
  const body = publicBodyFromSides(mapped);
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
      <p className="font-medium text-zinc-900">Qué se guardaría, sin columna nueva</p>
      <p className="mt-2 text-zinc-700">{mapped.reason}</p>
      <p className="mt-3 whitespace-pre-wrap font-mono text-xs text-zinc-800">
        {body || "Nada todavía."}
      </p>
    </div>
  );
}

function ProvisionalEnding({ state }: { state: PreviewController }) {
  return (
    <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-tight">Ficha provisional, en revisión</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-700">
        «{state.query.trim()}» no se ha unido a otra empresa. La ficha saldría marcada como provisional y la experiencia no se leería hasta la revisión.
      </p>
      <button type="button" className="btn-primary mt-6 min-h-11" onClick={() => state.go("cuenta")}>
        Ver el estado en tu cuenta
      </button>
    </section>
  );
}

function ProposedEnding({
  state,
  agencyId,
  agencyName,
}: {
  state: PreviewController;
  agencyId: string;
  agencyName: string;
}) {
  const published = state.result === "inmediata";
  return (
    <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        {published ? "Ya se lee en la ficha" : "No está en la ficha todavía"}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-700">
        {published
          ? `La experiencia sobre ${agencyName} ya se lee como experiencia declarada.`
          : `La experiencia sobre ${agencyName} está en revisión. En tu cuenta figura como pendiente.`}
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {published ? (
          <button type="button" className="btn-primary min-h-11" onClick={() => state.openFicha(agencyId)}>
            Ver esa experiencia
          </button>
        ) : (
          <button type="button" className="btn-primary min-h-11" onClick={() => state.go("cuenta")}>
            Ver el estado en tu cuenta
          </button>
        )}
        <button type="button" className="btn-secondary min-h-11" onClick={() => state.setResult(null)}>
          Volver al formulario
        </button>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block text-xs font-medium text-zinc-600">
      {label}
      <input readOnly value={value} className="input-field mt-1 font-normal text-zinc-500" />
    </label>
  );
}
