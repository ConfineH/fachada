"use client";

import { useState } from "react";

import { CurrentAccount, ProposedAccount } from "@/components/preview/account-views";
import { CurrentFicha, ProposedFicha } from "@/components/preview/ficha-views";
import { CurrentHome, ProposedHome } from "@/components/preview/home-views";
import { CurrentPublish, ProposedPublish } from "@/components/preview/publish-views";
import { CurrentSearch, ProposedSearch } from "@/components/preview/search-views";
import {
  type FormMode,
  type PreviewArch,
  type PreviewController,
  type PreviewScreen,
  type PublishResult,
} from "@/components/preview/state";
import { PREVIEW_NOTICE } from "@/lib/preview/fixtures";

const SCREENS: { id: PreviewScreen; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "buscar", label: "Búsqueda" },
  { id: "ficha", label: "Ficha" },
  { id: "publicar", label: "Publicar" },
  { id: "cuenta", label: "Cuenta" },
];

const FICHAS = [
  { id: "alba", label: "Sin reseñas" },
  { id: "norte", label: "Una reseña" },
  { id: "sur", label: "Varias, y una sin ciudad" },
];

const QUERIES = ["NorteLlaves", "Patio Sur", "Madrid", "Zzz Inmobiliaria"];

export function PreviewApp() {
  const [screen, setScreen] = useState<PreviewScreen>("home");
  const [arch, setArch] = useState<PreviewArch>("propuesta");
  const [query, setQuery] = useState("");
  const [fichaId, setFichaId] = useState("alba");
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>("conservador");
  const [result, setResult] = useState<PublishResult>(null);
  const [publishAgencyId, setPublishAgencyId] = useState<string | null>(null);

  const state: PreviewController = {
    go: (next) => {
      setResult(null);
      setScreen(next);
    },
    query,
    setQuery,
    fichaId,
    openFicha: (id) => {
      setFichaId(id);
      setCityFilter(null);
      setScreen("ficha");
    },
    openPublish: (id) => {
      setPublishAgencyId(id);
      setResult(null);
      setScreen("publicar");
    },
    cityFilter,
    setCityFilter,
    formMode,
    result,
    setResult,
    publishAgencyId,
  };

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-stone-300 bg-stone-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
          <p className="text-xs leading-relaxed text-zinc-600">{PREVIEW_NOTICE} No corrige el parser de reseñas ni el buscador real.</p>
          <div className="flex gap-2 overflow-x-auto">
            {SCREENS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`filter-chip shrink-0 ${screen === item.id ? "filter-chip-active" : "filter-chip-idle"}`}
                onClick={() => state.go(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["actual", "Actual"],
                ["propuesta", "Propuesta"],
                ["ambas", "Las dos"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`filter-chip ${arch === id ? "filter-chip-active" : "filter-chip-idle"}`}
                onClick={() => setArch(id)}
              >
                {label}
              </button>
            ))}
          </div>
          {screen === "ficha" ? (
            <div className="flex flex-wrap gap-2">
              {FICHAS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`filter-chip ${fichaId === item.id ? "filter-chip-active" : "filter-chip-idle"}`}
                  onClick={() => {
                    setFichaId(item.id);
                    setCityFilter(null);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
          {screen === "buscar" || screen === "publicar" ? (
            <div className="flex flex-wrap gap-2">
              {QUERIES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="filter-chip filter-chip-idle"
                  onClick={() => {
                    setQuery(sample);
                    setResult(null);
                    setPublishAgencyId(null);
                    setScreen(screen);
                  }}
                >
                  {sample}
                </button>
              ))}
            </div>
          ) : null}
          {screen === "publicar" ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`filter-chip ${formMode === "conservador" ? "filter-chip-active" : "filter-chip-idle"}`}
                onClick={() => setFormMode("conservador")}
              >
                Formulario actual
              </button>
              <button
                type="button"
                className={`filter-chip ${formMode === "alternativa" ? "filter-chip-active" : "filter-chip-idle"}`}
                onClick={() => setFormMode("alternativa")}
              >
                Un solo lado
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <div className={arch === "ambas" ? "xl:grid xl:grid-cols-2" : ""}>
        {arch !== "propuesta" ? (
          <section className="min-w-0 border-b border-stone-200 xl:border-r xl:border-b-0">
            <p className="bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6">
              Arquitectura actual
            </p>
            <Screen arch="actual" screen={screen} state={state} />
          </section>
        ) : null}
        {arch !== "actual" ? (
          <section className="min-w-0">
            <p className="bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:px-6">
              Propuesta
            </p>
            <Screen arch="propuesta" screen={screen} state={state} />
          </section>
        ) : null}
      </div>
      <Decisions />
    </div>
  );
}

function Screen({
  arch,
  screen,
  state,
}: {
  arch: "actual" | "propuesta";
  screen: PreviewScreen;
  state: PreviewController;
}) {
  if (screen === "home") return arch === "actual" ? <CurrentHome state={state} /> : <ProposedHome state={state} />;
  if (screen === "buscar") return arch === "actual" ? <CurrentSearch state={state} /> : <ProposedSearch state={state} />;
  if (screen === "ficha") return arch === "actual" ? <CurrentFicha state={state} /> : <ProposedFicha state={state} />;
  if (screen === "publicar") return arch === "actual" ? <CurrentPublish state={state} /> : <ProposedPublish state={state} />;
  return arch === "actual" ? <CurrentAccount state={state} /> : <ProposedAccount state={state} />;
}

function Decisions() {
  return (
    <section className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h2 className="text-lg font-semibold">Decisiones que siguen pendientes</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-700">
          <li>La cabecera propuesta es Buscar, Contar experiencia y Cuenta. Publicar no se esconde: en una ficha vacía es el bloque principal.</li>
          <li>La alternativa de un solo lado no añade columnas. El lado vacío se omite en el texto público. Hace falta relajar la validación que hoy exige los dos.</li>
          <li>Una experiencia sin ciudad se lee en «Todas» como «Ciudad no indicada». Un filtro de ciudad la deja fuera y lo dice. No se rellena con la ciudad de la ficha.</li>
          <li>Dos coincidencias por encima del umbral 0,45 se muestran juntas. La ficha provisional solo sigue después de descartarlas.</li>
        </ul>
      </div>
    </section>
  );
}
