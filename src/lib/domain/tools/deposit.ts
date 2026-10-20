import { REFORM_2026_ACTIVE, reform2026Applies } from "@/lib/domain/tools/constants";
import { addDays, addMonths, parseIsoDate } from "@/lib/domain/tools/dates";
import { roundCents } from "@/lib/domain/tools/money";

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
  monthlyRentEur: number | null;
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

function depositExcess(
  kind: "vivienda" | "temporada",
  depositEur: number,
  extraEur: number,
  monthlyRentEur: number | null | undefined,
) {
  const rent = monthlyRentEur == null ? null : roundCents(monthlyRentEur);
  if (rent === null || rent <= 0) {
    return {
      excessiveDeposit: false,
      excessiveGuarantee: false,
      monthlyRentEur: null,
    };
  }
  const rentCents = Math.round(rent * 100);
  const guaranteeCap = kind === "temporada" ? rentCents : rentCents * 2;
  return {
    excessiveDeposit: kind !== "temporada" && Math.round(depositEur * 100) > rentCents,
    excessiveGuarantee: Math.round(extraEur * 100) > guaranteeCap,
    monthlyRentEur: rent,
  };
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
    presumptionApplies: reform2026Applies(input.keysDate, reformActive),
    ...depositExcess(input.contractKind ?? "vivienda", depositEur, extraEur, input.monthlyRentEur),
    contractKind: input.contractKind ?? "vivienda",
    landlordName,
    tenantName,
    address,
    contractStart: input.contractStart,
    contractEnd: input.contractEnd || null,
    keysDate: input.keysDate,
    today: input.today,
  };
}
