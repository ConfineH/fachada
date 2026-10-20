import {
  FEE_RULE_START,
  LAWYER_FREE_MAX_EUR,
  type ContractKind,
} from "@/lib/domain/tools/constants";
import { parseIsoDate } from "@/lib/domain/tools/dates";
import { roundCents } from "@/lib/domain/tools/money";

export const FEE_CONCEPTS = ["honorarios", "gestion", "solvencia", "otro"] as const;
export type FeeConcept = (typeof FEE_CONCEPTS)[number];

export const FEE_COLLECTORS = ["agencia", "arrendador", "otro"] as const;
export type FeeCollector = (typeof FEE_COLLECTORS)[number];

const RECLAIMABLE_CONCEPTS = new Set<FeeConcept>(["honorarios", "gestion", "solvencia"]);

export type FeeInput = {
  signedOn: string;
  contract: ContractKind;
  amountEur: number;
  concept: FeeConcept;
  collector: FeeCollector;
};

export type FeeResult =
  | { status: "invalid"; code: "invalid_date" | "invalid_amount" }
  | { status: "no_charge"; code: "no_amount" }
  | {
      status: "doubtful";
      code: "before_reform" | "seasonal" | "room" | "other_concept";
    }
  | {
      status: "reclaimable";
      code: "reclaimable";
      amountEur: number;
      lawyerRequired: boolean;
      collector: FeeCollector;
      concept: FeeConcept;
    };

export function assessFees(input: FeeInput): FeeResult {
  if (!parseIsoDate(input.signedOn)) return { status: "invalid", code: "invalid_date" };

  const amount = roundCents(input.amountEur);
  if (amount === null || amount < 0) return { status: "invalid", code: "invalid_amount" };
  if (amount === 0) return { status: "no_charge", code: "no_amount" };

  if (input.contract === "temporada") return { status: "doubtful", code: "seasonal" };
  if (input.contract === "habitacion") return { status: "doubtful", code: "room" };
  if (input.signedOn < FEE_RULE_START) return { status: "doubtful", code: "before_reform" };
  if (!RECLAIMABLE_CONCEPTS.has(input.concept)) {
    return { status: "doubtful", code: "other_concept" };
  }

  return {
    status: "reclaimable",
    code: "reclaimable",
    amountEur: amount,
    lawyerRequired: amount > LAWYER_FREE_MAX_EUR,
    collector: input.collector,
    concept: input.concept,
  };
}
