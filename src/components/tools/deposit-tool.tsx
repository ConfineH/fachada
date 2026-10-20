"use client";

import { useState } from "react";

import { Field, Result } from "@/components/tools/fields";
import {
  DEPOSIT_STAYS_LOCAL,
  FIELD_HINTS,
  depositDocuments,
  depositView,
} from "@/lib/domain/tools/copy";
import { assessDeposit } from "@/lib/domain/tools/deposit";
import { localTodayIso } from "@/lib/domain/tools/dates";
import { parseEuroInput } from "@/lib/domain/tools/money";

export function DepositTool() {
  const [landlordName, setLandlordName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [address, setAddress] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [keysDate, setKeysDate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [extra, setExtra] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [contractKind, setContractKind] = useState<"vivienda" | "temporada">("vivienda");
  const [deduction, setDeduction] = useState("");
  const [deductionDetail, setDeductionDetail] = useState("");
  const [acceptDeduction, setAcceptDeduction] = useState(false);
  const [copied, setCopied] = useState<"letter" | "burofax" | null>(null);

  const monthlyRentEur = monthlyRent.trim() === "" ? null : parseEuroInput(monthlyRent);
  const depositEur = parseEuroInput(deposit);
  const extraEur = parseEuroInput(extra === "" ? "0" : extra);
  const deductionEur = parseEuroInput(deduction === "" ? "0" : deduction);
  const started = landlordName.trim() && tenantName.trim() && address.trim() && contractStart && keysDate && deposit.trim();

  const result =
    started && depositEur !== null && extraEur !== null && deductionEur !== null
      ? assessDeposit({
          landlordName,
          tenantName,
          address,
          contractStart,
          contractEnd,
          keysDate,
          depositEur,
          extraEur,
          deductionEur,
          deductionDetail,
          acceptDeduction,
          today: localTodayIso(),
          monthlyRentEur,
          contractKind,
        })
      : null;
  const docs = result?.status === "ready" ? depositDocuments(result) : null;
  const blocked = result && result.status !== "ready" ? depositView(result.code) : null;

  async function copy(kind: "letter" | "burofax", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-700">
        {DEPOSIT_STAYS_LOCAL}
      </p>
      <div className="no-print card-raised space-y-5 p-5 sm:p-6">
        <Field label="Arrendador">
          <input className="input-field min-h-11" autoComplete="off" value={landlordName} onChange={(event) => setLandlordName(event.target.value)} />
        </Field>
        <Field label="Arrendatario">
          <input className="input-field min-h-11" autoComplete="off" value={tenantName} onChange={(event) => setTenantName(event.target.value)} />
        </Field>
        <Field label="Dirección de la vivienda">
          <input className="input-field min-h-11" autoComplete="off" value={address} onChange={(event) => setAddress(event.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Inicio del contrato">
            <input className="input-field min-h-11" type="date" value={contractStart} onChange={(event) => setContractStart(event.target.value)} />
          </Field>
          <Field label="Fin del contrato" hint={FIELD_HINTS.optionalEnd}>
            <input className="input-field min-h-11" type="date" value={contractEnd} onChange={(event) => setContractEnd(event.target.value)} />
          </Field>
        </div>
        <Field label="Entrega de llaves">
          <input className="input-field min-h-11" type="date" value={keysDate} onChange={(event) => setKeysDate(event.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de contrato">
            <select
              className="input-field min-h-11"
              value={contractKind}
              onChange={(event) =>
                setContractKind(event.target.value as "vivienda" | "temporada")
              }
            >
              <option value="vivienda">Vivienda habitual</option>
              <option value="temporada">Vivienda temporal</option>
            </select>
          </Field>
          <Field label="Renta mensual" hint="Opcional. Sirve para avisar si la fianza o las garantías pasan el tope legal.">
            <input className="input-field min-h-11" inputMode="decimal" value={monthlyRent} onChange={(event) => setMonthlyRent(event.target.value)} placeholder="900" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fianza" hint={FIELD_HINTS.euro}>
            <input className="input-field min-h-11" inputMode="decimal" value={deposit} onChange={(event) => setDeposit(event.target.value)} placeholder="900" />
          </Field>
          <Field label="Garantías adicionales">
            <input className="input-field min-h-11" inputMode="decimal" value={extra} onChange={(event) => setExtra(event.target.value)} placeholder="0" />
          </Field>
        </div>
        <Field label="Deducciones alegadas">
          <input className="input-field min-h-11" inputMode="decimal" value={deduction} onChange={(event) => setDeduction(event.target.value)} placeholder="0" />
        </Field>
        <Field label="Concepto de esas deducciones">
          <input className="input-field min-h-11" value={deductionDetail} onChange={(event) => setDeductionDetail(event.target.value)} />
        </Field>
        {deductionEur !== null && deductionEur > 0 ? (
          <fieldset>
            <legend className="text-sm font-medium text-zinc-800">¿Aceptas ese descuento?</legend>
            <div className="mt-2 grid gap-2">
              <label className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-300 bg-white px-3 text-sm">
                <input type="radio" name="accept-deduction" checked={!acceptDeduction} onChange={() => setAcceptDeduction(false)} />
                No. Lo discuto y reclamo el total.
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-300 bg-white px-3 text-sm">
                <input type="radio" name="accept-deduction" checked={acceptDeduction} onChange={() => setAcceptDeduction(true)} />
                Sí. Réstalo del importe.
              </label>
            </div>
          </fieldset>
        ) : null}
      </div>

      {blocked ? (
        <Result tone={blocked.title.toLowerCase().includes("dudoso") ? "doubt" : "neutral"} title={blocked.title}>
          <p>{blocked.body}</p>
        </Result>
      ) : null}

      {docs && result?.status === "ready" ? (
        <div className="space-y-4">
          <Result tone={result.interestStarted ? "doubt" : "clear"} title={result.interestStarted ? "El mes ya pasó" : "Plazo de devolución"}>
            <p>
              {result.interestStarted
                ? "La fianza debía devolverse en el mes siguiente a las llaves. Ese plazo ya pasó, así que el saldo pendiente devenga el interés legal."
                : result.deadlineStatus === "due_today"
                  ? "El mes termina hoy. Si no ingresan el saldo, desde mañana devenga el interés legal."
                  : "Todavía no ha pasado el mes siguiente a la entrega de llaves. La carta sirve para pedirlo ya. El interés legal solo corre si ese plazo vence sin pago."}
            </p>
            {result.excessiveDeposit ? (
              <p>La fianza supera una mensualidad. El artículo 36.1 de la LAU puede hacer de ese exceso un cobro indebido. La carta lo dice.</p>
            ) : null}
            {result.excessiveGuarantee ? (
              <p>
                Las garantías adicionales superan el tope del artículo 36.5
                {result.contractKind === "temporada" ? " (una mensualidad en vivienda temporal)" : " (dos mensualidades en vivienda)"}
                . La carta lo dice.
              </p>
            ) : null}
          </Result>
          <div className="no-print flex flex-wrap gap-2">
            <button type="button" className="btn-primary min-h-11" onClick={() => window.print()}>
              Imprimir o guardar PDF
            </button>
            <button type="button" className="btn-secondary min-h-11" onClick={() => copy("letter", docs.letter)}>
              {copied === "letter" ? "Carta copiada" : "Copiar carta"}
            </button>
            <button type="button" className="btn-secondary min-h-11" onClick={() => copy("burofax", docs.burofax)}>
              {copied === "burofax" ? "Burofax copiado" : "Copiar burofax"}
            </button>
          </div>
          <article className="print-sheet card-raised space-y-8 p-5 sm:p-8">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Carta</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-900">{docs.letter}</p>
            </section>
            <section className="print-break">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Texto para burofax</h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-900">{docs.burofax}</p>
            </section>
          </article>
        </div>
      ) : started && !result ? (
        <p className="text-sm text-zinc-500">{FIELD_HINTS.euro}</p>
      ) : (
        <p className="text-sm text-zinc-500">Rellena las partes, la dirección y las fechas para generar la carta.</p>
      )}
    </div>
  );
}
