"use client";

import { useState } from "react";

import { ChoiceGroup, Field, Result } from "@/components/tools/fields";
import type { ContractKind } from "@/lib/domain/tools/constants";
import { CONTRACT_LABELS, FIELD_HINTS, earlyExitView } from "@/lib/domain/tools/copy";
import { assessEarlyExit } from "@/lib/domain/tools/early-exit";
import { parseEuroInput } from "@/lib/domain/tools/money";

const contracts = (Object.keys(CONTRACT_LABELS) as ContractKind[]).map((value) => ({
  value,
  label: CONTRACT_LABELS[value],
}));

const PRESETS = [
  { months: 12, label: "1 año" },
  { months: 60, label: "5 años" },
  { months: 84, label: "7 años" },
];

export function EarlyExitTool() {
  const [contract, setContract] = useState<ContractKind | "">("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("60");
  const [rent, setRent] = useState("");
  const [plannedExitDate, setPlannedExitDate] = useState("");
  const [agreed, setAgreed] = useState(false);

  const durationMonths = Number(duration);
  const monthlyRentEur = parseEuroInput(rent);
  const rentError = rent.trim() !== "" && monthlyRentEur === null;
  const result =
    contract && startDate && plannedExitDate && Number.isInteger(durationMonths) && monthlyRentEur !== null
      ? assessEarlyExit({
          contract,
          startDate,
          durationMonths,
          monthlyRentEur,
          plannedExitDate,
          compensationAgreed: agreed,
        })
      : null;
  const view = result ? earlyExitView(result) : null;
  const leaveTone =
    result?.status === "can_leave" ? "clear" : result?.status === "doubtful" ? "doubt" : "neutral";
  const compensationDoubt = view?.compensationTitle.toLowerCase().includes("dudoso");

  return (
    <div className="space-y-6">
      <div className="no-print card-raised space-y-5 p-5 sm:p-6">
        <ChoiceGroup
          legend="Tipo de contrato"
          name="exit-contract"
          value={contract}
          options={contracts}
          onChange={setContract}
        />
        <Field label="Fecha de inicio">
          <input className="input-field min-h-11" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </Field>
        <Field label="Duración pactada, en meses" hint={FIELD_HINTS.duration}>
          <input
            className="input-field min-h-11"
            type="number"
            min={1}
            step={1}
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.months}
                type="button"
                className="btn-secondary min-h-10 px-3"
                onClick={() => setDuration(String(preset.months))}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Renta mensual" hint={rentError ? FIELD_HINTS.euro : undefined}>
          <input
            className="input-field min-h-11"
            inputMode="decimal"
            value={rent}
            placeholder="950"
            aria-invalid={rentError}
            onChange={(event) => setRent(event.target.value)}
          />
        </Field>
        <Field label="Fecha prevista de salida">
          <input className="input-field min-h-11" type="date" value={plannedExitDate} onChange={(event) => setPlannedExitDate(event.target.value)} />
        </Field>
        <fieldset>
          <legend className="text-sm font-medium text-zinc-800">¿El contrato pacta indemnización?</legend>
          <div className="mt-2 grid gap-2">
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-300 bg-white px-3 text-sm">
              <input type="radio" name="compensation" checked={!agreed} onChange={() => setAgreed(false)} />
              No
            </label>
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-300 bg-white px-3 text-sm">
              <input type="radio" name="compensation" checked={agreed} onChange={() => setAgreed(true)} />
              Sí
            </label>
          </div>
        </fieldset>
      </div>

      {view ? (
        <div className="space-y-4">
          <Result tone={leaveTone} title={view.title}>
            <p>{view.body}</p>
          </Result>
          <Result tone={compensationDoubt ? "doubt" : "neutral"} title={view.compensationTitle}>
            <p>{view.compensationBody}</p>
          </Result>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Rellena el contrato, las fechas y la renta.</p>
      )}
    </div>
  );
}
