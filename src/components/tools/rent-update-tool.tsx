"use client";

import { useState } from "react";

import { ChoiceGroup, Field, Result } from "@/components/tools/fields";
import {
  formatPercent,
  rentNeedsReferenceReply,
  rentUpdateReply,
  rentUpdateView,
} from "@/lib/domain/tools/copy";
import {
  IRAV_LOADED_ON,
  IRAV_SOURCE_URL,
  IRAV_TABLE,
  REFORM_2026_ACTIVE,
  TOOL_TEXTS_REVIEWED_ON,
} from "@/lib/domain/tools/constants";
import { formatEuro, parseEuroInput } from "@/lib/domain/tools/money";
import {
  assessRentUpdate,
  extraordinaryRentApplies,
  type ReferencePriceAnswer,
  type RentIndex,
} from "@/lib/domain/tools/rent-update";

const INDEXES: Array<{ value: RentIndex; label: string }> = [
  { value: "irav", label: "IRAV" },
  { value: "ipc", label: "IPC" },
  { value: "igc", label: "Índice de garantía de competitividad" },
  { value: "otro", label: "Otro, o no detalla el índice" },
];

export function RentUpdateTool() {
  const [contractDate, setContractDate] = useState("");
  const [updateDate, setUpdateDate] = useState("");
  const [rent, setRent] = useState("");
  const [asked, setAsked] = useState("");
  const [hasClause, setHasClause] = useState<boolean | null>(null);
  const [index, setIndex] = useState<RentIndex | "">("");
  const [aboveReference, setAboveReference] = useState<ReferencePriceAnswer | null>(null);
  const [copied, setCopied] = useState(false);

  const currentRentEur = rent.trim() === "" ? null : parseEuroInput(rent);
  const askedRentEur = asked.trim() === "" ? null : parseEuroInput(asked);
  const showReference =
    hasClause === true && Boolean(updateDate) && extraordinaryRentApplies(updateDate, REFORM_2026_ACTIVE);
  const started = Boolean(contractDate && updateDate && rent.trim() && hasClause !== null);
  const result = started
    ? assessRentUpdate({
        contractDate,
        updateDate,
        currentRentEur,
        hasClause,
        index: index || null,
        askedRentEur,
        aboveReference: showReference ? aboveReference : null,
      })
    : null;
  const view = result ? rentUpdateView(result) : null;
  const reply =
    result?.status === "ready"
      ? rentUpdateReply(result)
      : result?.status === "needs_reference"
        ? rentNeedsReferenceReply(result)
        : null;
  const latest = IRAV_TABLE.at(-1);
  const [year, month, day] = IRAV_LOADED_ON.split("-");

  async function copyReply() {
    if (!reply) return;
    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500">Texto legal revisado el {TOOL_TEXTS_REVIEWED_ON}.</p>
      <p className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-700">
        El cálculo se hace en el navegador. El IRAV no se consulta al vuelo: la tabla se cargó el {day}/{month}/{year}
        {latest ? ` y el último mes es ${latest.month} (${formatPercent(latest.value)})` : ""}.{" "}
        <a className="link-brand" href={IRAV_SOURCE_URL} target="_blank" rel="noopener noreferrer">
          Serie IRAV1 del INE
        </a>
        .
      </p>
      <div className="card-raised space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha de firma del contrato">
            <input className="input-field min-h-11" type="date" value={contractDate} onChange={(event) => setContractDate(event.target.value)} />
          </Field>
          <Field label="Fecha de la actualización">
            <input className="input-field min-h-11" type="date" value={updateDate} onChange={(event) => setUpdateDate(event.target.value)} />
          </Field>
        </div>
        <Field label="Renta actual" hint="Escribe el importe con céntimos si hace falta. Por ejemplo, 1.200,50.">
          <input className="input-field min-h-11" inputMode="decimal" value={rent} placeholder="900" onChange={(event) => setRent(event.target.value)} />
        </Field>
        <ChoiceGroup
          legend="¿El contrato prevé la actualización anual?"
          name="rent-clause"
          value={hasClause === null ? "" : hasClause ? "si" : "no"}
          options={[
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
          ]}
          onChange={(value) => setHasClause(value === "si")}
        />
        {hasClause ? (
          <ChoiceGroup
            legend="¿Qué índice menciona?"
            name="rent-index"
            value={index}
            options={INDEXES}
            onChange={setIndex}
          />
        ) : null}
        {showReference ? (
          <ChoiceGroup
            legend="¿La renta supera el índice de precios de referencia?"
            name="reference-price"
            value={aboveReference ?? ""}
            options={[
              { value: "above", label: "Sí, lo supera" },
              { value: "within", label: "No lo supera" },
              { value: "unknown", label: "No lo sé" },
            ]}
            onChange={setAboveReference}
          />
        ) : null}
        <Field label="Renta que te piden" hint="Opcional. Sirve para ver si pasa el tope.">
          <input className="input-field min-h-11" inputMode="decimal" value={asked} placeholder="950" onChange={(event) => setAsked(event.target.value)} />
        </Field>
      </div>

      {view && result ? (
        <Result
          tone={result.status === "ready" && result.exceeds ? "doubt" : result.status === "ready" ? "clear" : "neutral"}
          title={view.title}
        >
          <p>{view.body}</p>
          {result.status === "ready" ? (
            <p className="font-medium">
              Renta máxima: {formatEuro(result.maxRentEur)} ({formatPercent(result.percent)})
            </p>
          ) : null}
        </Result>
      ) : (
        <p className="text-sm text-zinc-500">Indica el contrato, la renta y si hay cláusula de actualización.</p>
      )}

      {reply ? (
        <div className="card-raised space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Texto para responder</h2>
            <button type="button" className="btn-secondary min-h-11" onClick={() => void copyReply()}>
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">{reply}</p>
        </div>
      ) : null}
    </div>
  );
}
