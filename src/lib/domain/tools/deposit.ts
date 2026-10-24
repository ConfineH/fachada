import { REFORM_2026_ACTIVE, REFORM_2026_START, reform2026Applies } from "@/lib/domain/tools/constants";
import { addDays, addMonths, parseIsoDate } from "@/lib/domain/tools/dates";
import { roundCents } from "@/lib/domain/tools/money";

/** Art. 36.5: hasta cinco años, o hasta siete si el arrendador es persona jurídica. */
const HOUSING_CAP_FIVE_MONTHS = 60;
const HOUSING_CAP_SEVEN_MONTHS = 84;

/**
 * Cómo se aplica el tope de garantía adicional del art. 36.5.
 * `uncertain_*` no marca el exceso como ilegal: falta un dato.
 */
export type GuaranteeCap =
  | "none"
  | "housing_five"
  | "housing_seven"
  | "temporal"
  | "uncertain_landlord"
  | "uncertain_end";

export type DepositInput = {
  landlordName: string;
  tenantName: string;
  address: string;
  contractStart: string;
  contractEnd: string;
  keysDate: string;
  depositEur: number;
  extraEur: number;
  deductionEur: number;
  deductionDetail: string;
  acceptDeduction: boolean;
  today: string;
  monthlyRentEur?: number | null;
  contractKind?: "vivienda" | "temporada";
  /** null si no consta. Solo decide el tope entre cinco y siete años. */
  landlordLegalEntity?: boolean | null;
};

export type DepositReady = {
  status: "ready";
  deadline: string;
  deadlineStatus: "pending" | "due_today" | "overdue";
  interestStarted: boolean;
  claimedEur: number;
  depositEur: number;
  extraEur: number;
  deductionEur: number;
  deductionDetail: string;
  acceptDeduction: boolean;
  presumptionApplies: boolean;
  excessiveDeposit: boolean;
  excessiveGuarantee: boolean;
  guaranteeCap: GuaranteeCap;
  monthlyRentEur: number | null;
  landlordLegalEntity: boolean | null;
  contractKind: "vivienda" | "temporada";
  landlordName: string;
  tenantName: string;
  address: string;
  contractStart: string;
  contractEnd: string | null;
  keysDate: string;
  today: string;
};

export type DepositResult =
  | {
      status: "invalid";
      code:
        | "missing_parties"
        | "invalid_date"
        | "invalid_amount"
        | "end_before_start"
        | "no_amount";
    }
  | { status: "doubtful"; code: "keys_before_contract" | "deduction_exceeds" }
  | DepositReady;

function cleanLine(value: string, max: number): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function endsWithinMonths(start: string, end: string, months: number): boolean | null {
  const limit = addMonths(start, months);
  if (!limit) return null;
  return end <= limit;
}

/**
 * Tope del art. 36.5 en vivienda habitual. No rige por el solo hecho de ser
 * arrendamiento de vivienda: hace falta un plazo de hasta cinco años, o de
 * hasta siete si el arrendador es persona jurídica.
 */
function housingGuaranteeCap(
  contractStart: string,
  contractEnd: string | null,
  landlordLegalEntity: boolean | null,
): GuaranteeCap {
  if (!contractEnd) return "uncertain_end";
  const withinFive = endsWithinMonths(contractStart, contractEnd, HOUSING_CAP_FIVE_MONTHS);
  const withinSeven = endsWithinMonths(contractStart, contractEnd, HOUSING_CAP_SEVEN_MONTHS);
  if (withinFive === null || withinSeven === null) return "uncertain_end";
  if (withinFive) return "housing_five";
  if (!withinSeven) return "none";
  if (landlordLegalEntity === true) return "housing_seven";
  if (landlordLegalEntity === false) return "none";
  return "uncertain_landlord";
}

/**
 * Temporada anterior al 08/10/2026: DT 8.ª de la LAU, uso distinto, sin el
 * tope de una mensualidad. Desde esa fecha, el art. 36.5 lo limita a una.
 */
function temporalGuaranteeCap(contractStart: string, reformActive: boolean): GuaranteeCap {
  if (!reformActive || contractStart < REFORM_2026_START) return "none";
  return "temporal";
}

function depositExcess(
  kind: "vivienda" | "temporada",
  depositEur: number,
  extraEur: number,
  monthlyRentEur: number | null | undefined,
  contractStart: string,
  contractEnd: string | null,
  landlordLegalEntity: boolean | null,
  reformActive: boolean,
) {
  const rent = monthlyRentEur == null ? null : roundCents(monthlyRentEur);
  if (rent === null || rent <= 0) {
    return {
      excessiveDeposit: false,
      excessiveGuarantee: false,
      guaranteeCap: "none" as const,
      monthlyRentEur: null,
    };
  }

  const rentCents = Math.round(rent * 100);
  const depositCents = Math.round(depositEur * 100);
  const extraCents = Math.round(extraEur * 100);
  const regime =
    kind === "temporada"
      ? temporalGuaranteeCap(contractStart, reformActive)
      : housingGuaranteeCap(contractStart, contractEnd, landlordLegalEntity);
  const capMonths = regime === "temporal" ? 1 : regime === "none" ? null : 2;
  const depositOver =
    kind === "temporada" && regime !== "temporal" ? 0 : Math.max(0, depositCents - rentCents);

  if (capMonths === null) {
    return {
      excessiveDeposit: false,
      excessiveGuarantee: false,
      guaranteeCap: "none" as const,
      monthlyRentEur: rent,
    };
  }

  const overCap = depositOver + extraCents > capMonths * rentCents;
  if (!overCap) {
    return {
      excessiveDeposit: false,
      excessiveGuarantee: false,
      guaranteeCap: "none" as const,
      monthlyRentEur: rent,
    };
  }

  if (regime === "uncertain_landlord" || regime === "uncertain_end") {
    return {
      excessiveDeposit: false,
      excessiveGuarantee: false,
      guaranteeCap: regime,
      monthlyRentEur: rent,
    };
  }

  return {
    excessiveDeposit: depositOver > 0,
    excessiveGuarantee: true,
    guaranteeCap: regime,
    monthlyRentEur: rent,
  };
}

/**
 * El art. 36.7 no alcanza al temporada anterior al 08/10/2026: la DT 8.ª lo
 * deja en uso distinto de vivienda. En los demás, la presunción sigue la
 * fecha de entrega de llaves.
 */
function handoverPresumption(
  kind: "vivienda" | "temporada",
  contractStart: string,
  keysDate: string,
  reformActive: boolean,
): boolean {
  if (!reform2026Applies(keysDate, reformActive)) return false;
  if (kind === "temporada" && contractStart < REFORM_2026_START) return false;
  return true;
}

export function assessDeposit(
  input: DepositInput,
  reformActive = REFORM_2026_ACTIVE,
): DepositResult {
  const landlordName = cleanLine(input.landlordName, 120);
  const tenantName = cleanLine(input.tenantName, 120);
  const address = cleanLine(input.address, 200);
  const deductionDetail = cleanLine(input.deductionDetail, 300);
  if (!landlordName || !tenantName || !address) {
    return { status: "invalid", code: "missing_parties" };
  }

  if (
    !parseIsoDate(input.contractStart) ||
    !parseIsoDate(input.keysDate) ||
    !parseIsoDate(input.today) ||
    (input.contractEnd !== "" && !parseIsoDate(input.contractEnd))
  ) {
    return { status: "invalid", code: "invalid_date" };
  }
  if (input.contractEnd && input.contractEnd < input.contractStart) {
    return { status: "invalid", code: "end_before_start" };
  }

  const depositEur = roundCents(input.depositEur);
  const extraEur = roundCents(input.extraEur);
  const deductionEur = roundCents(input.deductionEur);
  if (
    depositEur === null ||
    extraEur === null ||
    deductionEur === null ||
    depositEur < 0 ||
    extraEur < 0 ||
    deductionEur < 0
  ) {
    return { status: "invalid", code: "invalid_amount" };
  }
  if (depositEur + extraEur === 0) return { status: "invalid", code: "no_amount" };
  if (input.keysDate < input.contractStart) {
    return { status: "doubtful", code: "keys_before_contract" };
  }

  const totalCents = Math.round((depositEur + extraEur) * 100);
  const deductionCents = Math.round(deductionEur * 100);
  const accept = deductionCents > 0 && input.acceptDeduction;
  if (accept && deductionCents > totalCents) {
    return { status: "doubtful", code: "deduction_exceeds" };
  }

  const claimedEur = (accept ? totalCents - deductionCents : totalCents) / 100;
  const deadline = addMonths(input.keysDate, 1);
  if (!deadline) return { status: "invalid", code: "invalid_date" };

  const deadlineStatus =
    input.today < deadline ? "pending" : input.today === deadline ? "due_today" : "overdue";
  const dayAfter = addDays(deadline, 1);

  return {
    status: "ready",
    deadline,
    deadlineStatus,
    interestStarted: dayAfter !== null && input.today >= dayAfter,
    claimedEur,
    depositEur,
    extraEur,
    deductionEur,
    deductionDetail,
    acceptDeduction: accept,
    presumptionApplies: handoverPresumption(
      input.contractKind ?? "vivienda",
      input.contractStart,
      input.keysDate,
      reformActive,
    ),
    ...depositExcess(
      input.contractKind ?? "vivienda",
      depositEur,
      extraEur,
      input.monthlyRentEur,
      input.contractStart,
      input.contractEnd || null,
      input.landlordLegalEntity ?? null,
      reformActive,
    ),
    contractKind: input.contractKind ?? "vivienda",
    landlordLegalEntity: input.landlordLegalEntity ?? null,
    landlordName,
    tenantName,
    address,
    contractStart: input.contractStart,
    contractEnd: input.contractEnd || null,
    keysDate: input.keysDate,
    today: input.today,
  };
}
