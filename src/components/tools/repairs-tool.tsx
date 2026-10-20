"use client";

import { useState } from "react";

import { ChoiceGroup, Result } from "@/components/tools/fields";
import type { ContractKind } from "@/lib/domain/tools/constants";
import { CONTRACT_LABELS, repairItemsForUi, repairView } from "@/lib/domain/tools/copy";
import { assessRepair } from "@/lib/domain/tools/repairs";

const contracts = (Object.keys(CONTRACT_LABELS) as ContractKind[]).map((value) => ({
  value,
  label: CONTRACT_LABELS[value],
}));

export function RepairsTool() {
  const [contract, setContract] = useState<ContractKind | "">("");
  const [item, setItem] = useState("");
  const [situation, setSituation] = useState("");
  const [copied, setCopied] = useState(false);
  const items = repairItemsForUi();
  const selected = items.find((entry) => entry.id === item);
  const result = assessRepair({ contract, item, situation });
  const view = result.status === "incomplete" ? null : repairView(result);
  const tone =
    result.status === "answered" ? (result.payer === "arrendador" ? "clear" : "neutral") : result.status === "doubtful" ? "doubt" : "neutral";

  async function copyMessage(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="no-print card-raised space-y-5 p-5 sm:p-6">
        <ChoiceGroup
          legend="Tipo de contrato"
          name="repair-contract"
          value={contract}
          options={contracts}
          onChange={(value) => {
            setContract(value);
            setCopied(false);
          }}
        />
        {contract && contract !== "habitacion" ? (
          <ChoiceGroup
            legend="¿Qué hay que reparar?"
            name="repair-item"
            value={item}
            options={items.map((entry) => ({ value: entry.id, label: entry.label }))}
            onChange={(value) => {
              setItem(value);
              setSituation("");
              setCopied(false);
            }}
          />
        ) : null}
        {selected && contract !== "habitacion" ? (
          <ChoiceGroup
            legend="¿Cuál es el caso?"
            name="repair-situation"
            value={situation}
            options={selected.situations.map((entry) => ({
              value: entry.id,
              label: entry.label,
            }))}
            onChange={(value) => {
              setSituation(value);
              setCopied(false);
            }}
          />
        ) : null}
      </div>

      {view ? (
        <Result tone={tone} title={view.title}>
          <p>{view.body}</p>
          <div>
            <p className="font-medium text-zinc-900">Cómo decirlo</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              {view.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Mensaje</p>
            <p className="mt-3 whitespace-pre-wrap">{view.message}</p>
            <button
              type="button"
              className="btn-secondary mt-4 min-h-11"
              onClick={() => copyMessage(view.message)}
            >
              {copied ? "Mensaje copiado" : "Copiar mensaje"}
            </button>
          </div>
        </Result>
      ) : (
        <p className="text-sm text-zinc-500">Elige el contrato y el desperfecto.</p>
      )}
    </div>
  );
}
