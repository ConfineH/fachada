import {
  MIN_STAY_MONTHS,
  NOTICE_DAYS,
  REFORM_2026_START,
  type ContractKind,
} from "@/lib/domain/tools/constants";
import { addDays, addMonths, monthsBetween, parseIsoDate } from "@/lib/domain/tools/dates";
import { roundCents } from "@/lib/domain/tools/money";

export type EarlyExitInput = {
  contract: ContractKind;
  startDate: string;
  durationMonths: number;
  monthlyRentEur: number;
  plannedExitDate: string;
  compensationAgreed: boolean;
};

export type Compensation =
  | {
      status: "zero";
      code: "not_agreed" | "nothing_left" | "barred" | "not_applicable";
      eur: 0;
    }
  | { status: "doubtful_cap"; eur: number };

export type EarlyExitResult =
  | {
      status: "invalid";
      code: "invalid_date" | "invalid_duration" | "invalid_rent" | "exit_before_start";
    }
  | { status: "doubtful"; code: "seasonal" | "room" }
  | {
      status: "right_never" | "too_soon" | "can_leave" | "term_ended";
      regime: "classic" | "post_2026";
      endDate: string;
      earliestExit: string;
      plannedExitDate: string;
      noticeDeadline: string | null;
      compensationBasis: "planned" | "earliest" | "none";
      compensation: Compensation;
    };

const MAX_DURATION_MONTHS = 600;

/** One month of rent per remaining year. A shorter remainder is that same fraction. */
export function compensationCapEur(
  monthlyRentEur: number,
  exitIso: string,
  endIso: string,
): number | null {
  const months = monthsBetween(exitIso, endIso);
  const rent = roundCents(monthlyRentEur);
  if (months === null || rent === null) return null;
  if (months <= 0) return 0;
  return Math.round(rent * (months / 12) * 100) / 100;
}

export function assessEarlyExit(input: EarlyExitInput): EarlyExitResult {
  if (input.contract === "temporada") return { status: "doubtful", code: "seasonal" };
  if (input.contract === "habitacion") return { status: "doubtful", code: "room" };

  if (!parseIsoDate(input.startDate) || !parseIsoDate(input.plannedExitDate)) {
    return { status: "invalid", code: "invalid_date" };
  }
  if (
    !Number.isInteger(input.durationMonths) ||
    input.durationMonths < 1 ||
    input.durationMonths > MAX_DURATION_MONTHS
  ) {
    return { status: "invalid", code: "invalid_duration" };
  }
  const rent = roundCents(input.monthlyRentEur);
  if (rent === null || rent <= 0) return { status: "invalid", code: "invalid_rent" };
  if (input.plannedExitDate < input.startDate) {
    return { status: "invalid", code: "exit_before_start" };
  }

  const endDate = addMonths(input.startDate, input.durationMonths);
  const earliestExit = addMonths(input.startDate, MIN_STAY_MONTHS);
  if (!endDate || !earliestExit) return { status: "invalid", code: "invalid_date" };

  const regime = input.startDate >= REFORM_2026_START ? "post_2026" : "classic";

  if (endDate <= earliestExit) {
    return {
      status: "right_never",
      regime,
      endDate,
      earliestExit,
      plannedExitDate: input.plannedExitDate,
      noticeDeadline: null,
      compensationBasis: "none",
      compensation: { status: "zero", code: "not_applicable", eur: 0 },
    };
  }

  if (input.plannedExitDate >= endDate) {
    return {
      status: "term_ended",
      regime,
      endDate,
      earliestExit,
      plannedExitDate: input.plannedExitDate,
      noticeDeadline: null,
      compensationBasis: "none",
      compensation: { status: "zero", code: "nothing_left", eur: 0 },
    };
  }

  const leavingEarly = input.plannedExitDate >= earliestExit;
  const exitForNotice = leavingEarly ? input.plannedExitDate : earliestExit;
  const noticeDeadline = addDays(exitForNotice, -NOTICE_DAYS);
  const cap = compensationCapEur(rent, exitForNotice, endDate);
  if (!noticeDeadline || cap === null) return { status: "invalid", code: "invalid_date" };

  return {
    status: leavingEarly ? "can_leave" : "too_soon",
    regime,
    endDate,
    earliestExit,
    plannedExitDate: input.plannedExitDate,
    noticeDeadline,
    compensationBasis: leavingEarly ? "planned" : "earliest",
    compensation: compensationFor(regime, input.compensationAgreed, cap),
  };
}

function compensationFor(
  regime: "classic" | "post_2026",
  agreed: boolean,
  capEur: number,
): Compensation {
  if (regime === "post_2026") return { status: "zero", code: "barred", eur: 0 };
  if (!agreed) return { status: "zero", code: "not_agreed", eur: 0 };
  if (capEur <= 0) return { status: "zero", code: "nothing_left", eur: 0 };
  return { status: "doubtful_cap", eur: capEur };
}
