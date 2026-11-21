"use client";

import { useState } from "react";

import { INCIDENT_TAG_LABELS, INCIDENT_TAGS, type IncidentTag } from "@/lib/domain/incidents";
import {
  AUTHENTICITY_LABELS,
  draftReady,
  mapNarrative,
  mapOptionalSides,
  publicBodyFromSides,
} from "@/lib/preview/narrative";
import { agencyById } from "@/lib/preview/fixtures";
import { provisionalAssessment } from "@/lib/preview/search";
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Reconstrucción</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Escribir reseña</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Sobre {agency.name}. En el producto, ventajas y desventajas son obligatorias a la vez y antes hay que identificarse.
          Esta columna no simula esa validación.
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
              <p className="text-xs text-zinc-500">
                El formulario real añade título, tipo de experiencia, ciudad, incidencias, cuatro declaraciones y un archivo opcional.
              </p>
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
  const [rejectedQuery, setRejectedQuery] = useState<string | null>(null);
  const [provisionalFor, setProvisionalFor] = useState<string | null>(null);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [narrative, setNarrative] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [checks, setChecks] = useState([false, false, false, false]);
  const [incidents, setIncidents] = useState<IncidentTag[]>([]);
  const agency = state.publishAgencyId ? agencyById(state.publishAgencyId) : null;
  const trimmedQuery = state.query.trim();
  const provisionalName = provisionalFor === trimmedQuery ? provisionalFor : null;
  const rejected = rejectedQuery === trimmedQuery;

  const ready = draftReady({
    mode: state.formMode,
    pros,
    cons,
    narrative,
    rating,
    declarationsAccepted: checks.filter(Boolean).length,
    incidentTags: incidents,
  });

  function finish(result: "inmediata" | "pendiente") {
    if (!ready.ready) return;
    state.setResult(result);
  }

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
            <ProvisionalEnding state={state} name={provisionalName ?? state.query.trim()} />
          )
        ) : agency || provisionalName ? (
          <form
            className="mt-8 space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              finish("inmediata");
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-700">
                {agency ? (
                  <>
                    Vas a escribir sobre <span className="font-semibold">{agency.name}</span>.
                  </>
                ) : (
                  <>
                    Ficha provisional «<span className="font-semibold">{provisionalName}</span>». No se une a otra empresa.
                  </>
                )}
              </p>
              <button
                type="button"
                className="text-sm font-medium text-brand"
                onClick={() => {
                  setProvisionalFor(null);
                  state.openPublish(null);
                }}
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
                  <input className="input-field mt-1" placeholder={agency?.cities[0] ?? "Ciudad del piso"} />
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
              {state.formMode === "narrativa" ? (
                <>
                  <TextSide label="Cuéntanos tu experiencia" value={narrative} onChange={setNarrative} />
                  <TextSide label="Qué funcionó, si quieres contarlo" value={pros} onChange={setPros} />
                  <TextSide label="Qué falló, si quieres contarlo" value={cons} onChange={setCons} />
                  <IncidentPicker selected={incidents} onChange={setIncidents} />
                  <StoragePreview mode="narrativa" narrative={narrative} pros={pros} cons={cons} incidents={incidents} />
                </>
              ) : state.formMode === "lados" ? (
                <>
                  <TextSide label="Qué falló" value={cons} onChange={setCons} />
                  <TextSide label="Qué funcionó" value={pros} onChange={setPros} />
                  <p className="text-sm text-zinc-600">Basta con un lado. El otro puede quedar vacío. No se inventa el texto que falta.</p>
                  <StoragePreview mode="lados" narrative="" pros={pros} cons={cons} incidents={[]} />
                </>
              ) : (
                <>
                  <TextSide label="Desventajas, obligatorias" value={cons} onChange={setCons} />
                  <TextSide label="Ventajas, obligatorias" value={pros} onChange={setPros} />
                  <p className="text-sm text-zinc-600">Este es el contrato actual: sin los dos textos, no se publica.</p>
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
            <p className="text-sm text-zinc-600">{ready.reason}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="submit" className="btn-primary min-h-12 disabled:cursor-not-allowed disabled:opacity-50" disabled={!ready.ready}>
                Simular publicación inmediata
              </button>
              <button
                type="button"
                className="btn-secondary min-h-12 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!ready.ready}
                onClick={() => finish("pendiente")}
              >
                Simular revisión
              </button>
            </div>
          </form>
        ) : (
          <AgencyPicker
            state={state}
            rejected={rejected}
            onReject={(value) => setRejectedQuery(value ? trimmedQuery : null)}
            onContinue={(name) => setProvisionalFor(name)}
          />
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
  onContinue,
}: {
  state: PreviewController;
  rejected: boolean;
  onReject: (value: boolean) => void;
  onContinue: (name: string) => void;
}) {
  const trimmed = state.query.trim();
  const gate = provisionalAssessment(trimmed);
  const canContinue = trimmed.length >= 2 && !gate.cityNameOnly && (!gate.blocksNewFicha || rejected);
  return (
    <div className="mt-8 space-y-6">
      <p className="text-sm leading-relaxed text-zinc-600">
        Primero localiza la inmobiliaria. Un alias exacto propone esa ficha. Un parecido del 0,45 solo avisa.
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
      {gate.ambiguous ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Hay más de una ficha posible. No las hemos unido. Elige una o descártalas para continuar con otro nombre.
        </p>
      ) : null}
      {gate.identified.length > 0 ? (
        <ul className="grid gap-4">
          {gate.identified.map((hit) => (
            <li key={hit.agency.id}>
              <AgencyChoice hit={hit} state={state} />
            </li>
          ))}
        </ul>
      ) : null}
      {gate.cityHits.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600">Fichas en esa ciudad. El nombre no queda identificado.</p>
          <ul className="grid gap-4">
            {gate.cityHits.map((hit) => (
              <li key={hit.agency.id}>
                <AgencyChoice hit={hit} state={state} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {gate.hints.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600">Parecidos. No identifican la empresa y no impiden seguir.</p>
          <ul className="grid gap-4">
            {gate.hints.map((hit) => (
              <li key={hit.agency.id}>
                <AgencyChoice hit={hit} state={state} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {gate.cityNameOnly && gate.identified.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">Escribe el nombre de la inmobiliaria</h2>
          <p className="mt-2 text-sm text-zinc-600">
            «{trimmed}» es una ciudad del archivo de ejemplo. Con solo eso no se crea una ficha.
          </p>
        </div>
      ) : null}
      {trimmed.length >= 2 && !gate.cityNameOnly ? (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold">
            {gate.blocksNewFicha ? "¿Ninguna es la tuya?" : "Ninguna ficha queda identificada"}
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            {gate.blocksNewFicha
              ? "Para una ficha nueva hay que descartar estas coincidencias. No se fusionan solas."
              : `«${trimmed}» puede seguir como ficha provisional. El siguiente paso es contar la experiencia.`}
          </p>
          {gate.blocksNewFicha ? (
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={rejected} onChange={(event) => onReject(event.target.checked)} />
              No es ninguna de estas fichas.
            </label>
          ) : null}
          <button
            type="button"
            className="btn-primary mt-4 min-h-11 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canContinue}
            onClick={() => onContinue(trimmed)}
          >
            Continuar con la ficha provisional
          </button>
        </div>
      ) : null}
    </div>
  );
}

function IncidentPicker({
  selected,
  onChange,
}: {
  selected: IncidentTag[];
  onChange: (tags: IncidentTag[]) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-medium text-zinc-600">Incidencias, si aplica</legend>
      {INCIDENT_TAGS.map((tag) => (
        <label key={tag} className="flex items-start gap-2 text-sm text-zinc-800">
          <input
            type="checkbox"
            className="mt-1"
            checked={selected.includes(tag)}
            onChange={(event) =>
              onChange(event.target.checked ? [...selected, tag] : selected.filter((item) => item !== tag))
            }
          />
          {INCIDENT_TAG_LABELS[tag]}
        </label>
      ))}
    </fieldset>
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

function StoragePreview({
  mode,
  narrative,
  pros,
  cons,
  incidents,
}: {
  mode: "lados" | "narrativa";
  narrative: string;
  pros: string;
  cons: string;
  incidents: IncidentTag[];
}) {
  if (mode === "lados") {
    const mapped = mapOptionalSides({ pros, cons });
    return (
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
        <p className="font-medium text-zinc-900">Qué se guardaría, sin columna nueva</p>
        <p className="mt-2 text-zinc-700">{mapped.reason}</p>
        <p className="mt-3 whitespace-pre-wrap font-mono text-xs text-zinc-800">{publicBodyFromSides(mapped) || "Nada todavía."}</p>
      </div>
    );
  }
  const mapped = mapNarrative({ narrative, pros, cons, incidentTags: incidents });
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
      <p className="font-medium text-zinc-900">Qué se guardaría, sin columna nueva</p>
      <p className="mt-2 text-zinc-700">{mapped.reason}</p>
      <p className="mt-3 text-xs text-zinc-500">Título: {mapped.title || "—"}</p>
      <p className="mt-2 whitespace-pre-wrap font-mono text-xs text-zinc-800">{mapped.body || "Nada todavía."}</p>
      <p className="mt-2 text-xs text-zinc-500">
        Incidencias: {mapped.incidentTags.length > 0 ? mapped.incidentTags.map((tag) => INCIDENT_TAG_LABELS[tag]).join(", ") : "ninguna"}
      </p>
    </div>
  );
}

function ProvisionalEnding({ state, name }: { state: PreviewController; name: string }) {
  const published = state.result === "inmediata";
  return (
    <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-2xl font-semibold tracking-tight">Ficha provisional «{name}»</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-700">
        No se ha unido a otra empresa. La ficha queda pendiente de verificar.
        {published
          ? " La experiencia, con el texto y las declaraciones completos, seguiría el filtro habitual."
          : " La experiencia queda en revisión y todavía no se lee."}
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-primary min-h-11" onClick={() => state.go("cuenta")}>
          Ver el estado en tu cuenta
        </button>
        <button type="button" className="btn-secondary min-h-11" onClick={() => state.setResult(null)}>
          Volver al formulario
        </button>
      </div>
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
