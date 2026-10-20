"use client";

import { useState } from "react";

import { ChoiceGroup, Field, Result } from "@/components/tools/fields";
import type { ContractKind } from "@/lib/domain/tools/constants";
import {
  CONTRACT_LABELS,
  FEE_COLLECTOR_LABELS,
  FEE_CONCEPT_LABELS,
  FIELD_HINTS,
  feeView,
} from "@/lib/domain/tools/copy";
import { assessFees, type FeeCollector, type FeeConcept } from "@/lib/domain/tools/fees";
import { parseEuroInput } from "@/lib/domain/tools/money";

const contracts = (Object.keys(CONTRACT_LABELS) as ContractKind[]).map((value) => ({
  value,
  label: CONTRACT_LABELS[value],
}));

const concepts = (Object.keys(FEE_CONCEPT_LABELS) as FeeConcept[]).map((value) => ({
  value,
  label: FEE_CONCEPT_LABELS[value],
}));

const collectors = (Object.keys(FEE_COLLECTOR_LABELS) as FeeCollector[]).map((value) => ({
  value,
  label: FEE_COLLECTOR_LABELS[value],
}));

export function FeesTool() {
  const [signedOn, setSignedOn] = useState("");
  const [contract, setContract] = useState<ContractKind | "">("");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState<FeeConcept | "">("");
  const [collector, setCollector] = useState<FeeCollector | "">("");

  const parsed = parseEuroInput(amount);
  const amountError = amount.trim() !== "" && parsed === null;
  const view =
    signedOn && contract && concept && collector && parsed !== null
      ? feeView(
          assessFees({
            signedOn,
            contract,
            amountEur: parsed,
            concept,
            collector,
          }),
        )
      : null;
  const tone =
    view === null
      ? "neutral"
      : view.steps.length > 0
        ? "clear"
        : view.title.toLowerCase().includes("dudoso")
          ? "doubt"
          : "neutral";

  return (
    <div className="space-y-6">
      <div className="no-print card-raised space-y-5 p-5 sm:p-6">
        <Field label="Fecha de firma">
          <input
            className="input-field min-h-11"
            type="date"
            value={signedOn}
            onChange={(event) => setSignedOn(event.target.value)}
          />
        </Field>
        <ChoiceGroup
          legend="Tipo de contrato"
          name="fee-contract"
          value={contract}
          options={contracts}
          onChange={setContract}
        />
        <Field label="Importe cobrado" hint={amountError ? FIELD_HINTS.euro : undefined}>
          <input
            className="input-field min-h-11"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1.200,50"
            aria-invalid={amountError}
          />
        </Field>
        <ChoiceGroup
          legend="Concepto"
          name="fee-concept"
          value={concept}
          options={concepts}
          onChange={setConcept}
        />
        <ChoiceGroup
          legend="¿Quién lo cobró?"
          name="fee-collector"
          value={collector}
          options={collectors}
          onChange={setCollector}
        />
      </div>
      {view ? (
        <Result tone={tone} title={view.title}>
          <p>{view.body}</p>
          {view.steps.length > 0 ? (
            <ol className="list-decimal space-y-2 pl-5">
              {view.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : null}
        </Result>
      ) : (
        <p className="text-sm text-zinc-500">Rellena los datos para ver la orientación.</p>
      )}
    </div>
  );
}
