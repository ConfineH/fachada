import { REFORM_2026_ACTIVE, type ContractKind } from "@/lib/domain/tools/constants";

export const REPAIR_PAYERS = ["arrendador", "inquilino", "dudoso"] as const;
export type RepairPayer = (typeof REPAIR_PAYERS)[number];

export const REPAIR_FLOW = [
  {
    id: "caldera",
    situations: [
      { id: "no_funciona", payer: "arrendador", nuance: "habitabilidad" },
      { id: "mal_uso", payer: "inquilino", nuance: "culpa" },
      { id: "mantenimiento", payer: "dudoso", nuance: "mantenimiento" },
      { id: "no_se", payer: "dudoso", nuance: "causa_desconocida" },
    ],
  },
  {
    id: "electrodomesticos",
    situations: [
      { id: "incluido_uso", payer: "arrendador", nuance: "habitabilidad" },
      { id: "no_incluido", payer: "inquilino", nuance: "no_incluido" },
      { id: "lo_rompi", payer: "inquilino", nuance: "culpa" },
      { id: "no_se", payer: "dudoso", nuance: "causa_desconocida" },
    ],
  },
  {
    id: "humedades",
    situations: [
      { id: "filtracion", payer: "arrendador", nuance: "habitabilidad" },
      { id: "condensacion", payer: "dudoso", nuance: "condensacion" },
      { id: "lo_cause", payer: "inquilino", nuance: "culpa" },
      { id: "no_se", payer: "dudoso", nuance: "causa_desconocida" },
    ],
  },
  {
    id: "persianas",
    situations: [
      { id: "cinta", payer: "inquilino", nuance: "pequena" },
      { id: "mecanismo", payer: "arrendador", nuance: "habitabilidad" },
      { id: "lo_rompi", payer: "inquilino", nuance: "culpa" },
      { id: "no_se", payer: "dudoso", nuance: "causa_desconocida" },
    ],
  },
  {
    id: "cerraduras",
    situations: [
      { id: "llaves", payer: "inquilino", nuance: "culpa" },
      { id: "no_cierra", payer: "arrendador", nuance: "habitabilidad" },
      { id: "no_se", payer: "dudoso", nuance: "causa_desconocida" },
    ],
  },
  {
    id: "grifos",
    situations: [
      { id: "goteo", payer: "inquilino", nuance: "pequena" },
      { id: "instalacion", payer: "arrendador", nuance: "habitabilidad" },
      { id: "lo_rompi", payer: "inquilino", nuance: "culpa" },
      { id: "no_se", payer: "dudoso", nuance: "causa_desconocida" },
    ],
  },
  {
    id: "pintura",
    situations: [
      { id: "desgaste", payer: "inquilino", nuance: "pequena" },
      { id: "por_humedad", payer: "arrendador", nuance: "habitabilidad" },
      { id: "la_dane", payer: "inquilino", nuance: "culpa" },
      { id: "no_se", payer: "dudoso", nuance: "causa_desconocida" },
    ],
  },
] as const;

export type RepairItemId = (typeof REPAIR_FLOW)[number]["id"];
export type RepairSituationId = (typeof REPAIR_FLOW)[number]["situations"][number]["id"];

export type RepairInput = {
  contract: ContractKind | "";
  item: string;
  situation: string;
};

export type RepairResult =
  | { status: "incomplete" }
  | { status: "doubtful"; code: string; item?: string; situation?: string }
  | {
      status: "answered";
      payer: "arrendador" | "inquilino";
      nuance: string;
      item: string;
      situation: string;
    };

const TENANT_FAULT = new Set([
  "mal_uso",
  "lo_rompi",
  "llaves",
  "la_dane",
  "lo_cause",
]);

export function assessRepair(
  input: RepairInput,
  reformActive = REFORM_2026_ACTIVE,
): RepairResult {
  if (!input.contract) return { status: "incomplete" };
  if (input.contract === "habitacion") return { status: "doubtful", code: "habitacion" };
  if (!input.item) return { status: "incomplete" };

  const item = REPAIR_FLOW.find((entry) => entry.id === input.item);
  if (!item) return { status: "incomplete" };
  if (!input.situation) return { status: "incomplete" };

  const situation = item.situations.find((entry) => entry.id === input.situation);
  if (!situation) return { status: "incomplete" };

  if (TENANT_FAULT.has(situation.id)) {
    return {
      status: "answered",
      payer: "inquilino",
      nuance: "culpa",
      item: item.id,
      situation: situation.id,
    };
  }

  if (input.contract === "temporada" && reformActive) {
    if (situation.payer === "arrendador") {
      return {
        status: "answered",
        payer: "arrendador",
        nuance: "temporal_habitabilidad",
        item: item.id,
        situation: situation.id,
      };
    }
    if (situation.payer === "dudoso") {
      return {
        status: "doubtful",
        code: situation.nuance,
        item: item.id,
        situation: situation.id,
      };
    }
    return {
      status: "doubtful",
      code: "temporal_desgaste",
      item: item.id,
      situation: situation.id,
    };
  }

  if (situation.payer === "dudoso") {
    return {
      status: "doubtful",
      code: situation.nuance,
      item: item.id,
      situation: situation.id,
    };
  }

  return {
    status: "answered",
    payer: situation.payer,
    nuance: situation.nuance,
    item: item.id,
    situation: situation.id,
  };
}
