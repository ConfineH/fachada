import { addMonths, parseIsoDate } from "@/lib/domain/tools/dates";
import { roundCents } from "@/lib/domain/tools/money";
import {
  EXTRAORDINARY_RENT_CAP,
  EXTRAORDINARY_RENT_END,
  IRAV_LOADED_ON,
  IRAV_TABLE,
  REFORM_2026_ACTIVE,
  REFORM_2026_START,
  type IravRow,
} from "@/lib/domain/tools/constants";

export const RENT_INDEXES = ["irav", "ipc", "igc", "otro"] as const;
export type RentIndex = (typeof RENT_INDEXES)[number];

export const REFERENCE_ANSWERS = ["above", "within", "unknown"] as const;
export type ReferencePriceAnswer = (typeof REFERENCE_ANSWERS)[number];

export type RentBasis =
  | "no_pact"
  | "cap_2023"
  | "cap_2024"
  | "irav"
  | "extraordinary_zero"
  | "extraordinary_two";

export type RentUpdateInput = {
  contractDate: string;
  updateDate: string;
  currentRentEur: number | null;
  hasClause: boolean | null;
  index: RentIndex | null;
  askedRentEur: number | null;
  aboveReference: ReferencePriceAnswer | null;
  reformActive?: boolean;
};

export type RentReady = {
  status: "ready";
  basis: RentBasis;
  percent: number;
  currentRentEur: number;
  maxRentEur: number;
  askedRentEur: number | null;
  exceeds: boolean | null;
  onAnniversary: boolean;
  iravMonth: string | null;
  iravValue: number | null;
  index: RentIndex | null;
  extraordinary: boolean;
};

export type RentNeedsReference = {
  status: "needs_reference";
  currentRentEur: number;
  onAnniversary: boolean;
  iravMonth: string;
  iravValue: number;
  percentIfWithin: number;
  maxIfWithin: number;
  percentIfAbove: 0;
  maxIfAbove: number;
  askedRentEur: number | null;
};

export type RentUpdateResult =
  | {
      status: "invalid";
      code:
        | "invalid_date"
        | "invalid_rent"
        | "update_before_contract"
        | "choose_clause"
        | "choose_index"
        | "choose_reference";
    }
  | { status: "unsupported_period"; year: number }
  | { status: "missing_irav"; month: string; onAnniversary: boolean }
  | RentNeedsReference
  | RentReady;

/** Mes natural anterior a la fecha de actualización, YYYY-MM. */
export function iravReferenceMonth(updateDate: string): string | null {
  if (!parseIsoDate(updateDate)) return null;
  const previous = addMonths(`${updateDate.slice(0, 7)}-01`, -1);
  return previous ? previous.slice(0, 7) : null;
}

/**
 * IRAV del mes anterior. Si ese mes no está en la tabla, no se usa otro.
 * Si es el último mes cargado y la actualización es anterior a la fecha de
 * carga, tampoco: no sabemos si el INE ya lo había publicado ese día.
 */
export function lookupIrav(
  updateDate: string,
  table: readonly IravRow[] = IRAV_TABLE,
  loadedOn = IRAV_LOADED_ON,
): { status: "ok"; row: IravRow } | { status: "missing"; month: string } {
  const month = iravReferenceMonth(updateDate);
  if (!month) return { status: "missing", month: "" };
  const row = table.find((entry) => entry.month === month);
  if (!row) return { status: "missing", month };
  const latest = table.reduce<string | null>(
    (current, entry) => (current === null || entry.month > current ? entry.month : current),
    null,
  );
  if (latest === row.month && updateDate < loadedOn) return { status: "missing", month };
  return { status: "ok", row };
}

/** Aniversario del contrato, con el 29 de febrero sujeto al último día del mes. */
export function isRentAnniversary(contractDate: string, updateDate: string): boolean {
  const contract = parseIsoDate(contractDate);
  const update = parseIsoDate(updateDate);
  if (!contract || !update || update.getTime() <= contract.getTime()) return false;
  const year = update.getUTCFullYear();
  if (year <= contract.getUTCFullYear()) return false;
  const month = contract.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const expected = Date.UTC(year, month, Math.min(contract.getUTCDate(), lastDay));
  return update.getTime() === expected;
}

export function extraordinaryRentApplies(updateDate: string, reformActive: boolean): boolean {
  if (!reformActive || !parseIsoDate(updateDate)) return false;
  return updateDate >= REFORM_2026_START && updateDate <= EXTRAORDINARY_RENT_END;
}

function readyBase(
  input: RentUpdateInput,
  current: number,
  asked: number | null,
  extra: Pick<RentReady, "basis" | "percent" | "iravMonth" | "iravValue" | "extraordinary">,
): RentReady {
  const maxRentEur = roundCents(current * (1 + extra.percent / 100)) ?? current;
  return {
    status: "ready",
    currentRentEur: current,
    maxRentEur,
    askedRentEur: asked,
    exceeds: asked === null ? null : asked > maxRentEur + 0.001,
    onAnniversary: isRentAnniversary(input.contractDate, input.updateDate),
    index: input.hasClause ? input.index : null,
    ...extra,
  };
}

export function assessRentUpdate(input: RentUpdateInput): RentUpdateResult {
  const reformActive = input.reformActive ?? REFORM_2026_ACTIVE;
  if (!parseIsoDate(input.contractDate) || !parseIsoDate(input.updateDate)) {
    return { status: "invalid", code: "invalid_date" };
  }
  if (input.updateDate <= input.contractDate) {
    return { status: "invalid", code: "update_before_contract" };
  }
  if (input.currentRentEur === null || input.currentRentEur <= 0) {
    return { status: "invalid", code: "invalid_rent" };
  }
  if (
    input.askedRentEur !== null &&
    (input.askedRentEur <= 0 || !Number.isFinite(input.askedRentEur))
  ) {
    return { status: "invalid", code: "invalid_rent" };
  }
  if (input.hasClause === null) return { status: "invalid", code: "choose_clause" };

  const current = input.currentRentEur;
  const asked = input.askedRentEur;

  if (!input.hasClause) {
    return readyBase(input, current, asked, {
      basis: "no_pact",
      percent: 0,
      iravMonth: null,
      iravValue: null,
      extraordinary: false,
    });
  }
  if (!input.index) return { status: "invalid", code: "choose_index" };

  const year = Number(input.updateDate.slice(0, 4));
  if (year < 2023) return { status: "unsupported_period", year };

  const extraordinary = extraordinaryRentApplies(input.updateDate, reformActive);
  const irav = year >= 2025 ? lookupIrav(input.updateDate) : null;

  if (extraordinary && input.aboveReference === "above") {
    return readyBase(input, current, asked, {
      basis: "extraordinary_zero",
      percent: 0,
      iravMonth: irav?.status === "ok" ? irav.row.month : null,
      iravValue: irav?.status === "ok" ? irav.row.value : null,
      extraordinary: true,
    });
  }

  if (year === 2023 || year === 2024) {
    const percent = year === 2023 ? 2 : 3;
    return readyBase(input, current, asked, {
      basis: year === 2023 ? "cap_2023" : "cap_2024",
      percent,
      iravMonth: null,
      iravValue: null,
      extraordinary: false,
    });
  }

  if (!irav || irav.status === "missing") {
    return {
      status: "missing_irav",
      month: irav?.status === "missing" ? irav.month : (iravReferenceMonth(input.updateDate) ?? ""),
      onAnniversary: isRentAnniversary(input.contractDate, input.updateDate),
    };
  }

  if (extraordinary && input.aboveReference === null) {
    return { status: "invalid", code: "choose_reference" };
  }

  const withinPercent = extraordinary
    ? Math.min(EXTRAORDINARY_RENT_CAP, irav.row.value)
    : irav.row.value;

  if (extraordinary && input.aboveReference === "unknown") {
    const maxIfWithin = roundCents(current * (1 + withinPercent / 100)) ?? current;
    return {
      status: "needs_reference",
      currentRentEur: current,
      onAnniversary: isRentAnniversary(input.contractDate, input.updateDate),
      iravMonth: irav.row.month,
      iravValue: irav.row.value,
      percentIfWithin: withinPercent,
      maxIfWithin,
      percentIfAbove: 0,
      maxIfAbove: current,
      askedRentEur: asked,
    };
  }

  return readyBase(input, current, asked, {
    basis: extraordinary ? "extraordinary_two" : "irav",
    percent: withinPercent,
    iravMonth: irav.row.month,
    iravValue: irav.row.value,
    extraordinary,
  });
}
