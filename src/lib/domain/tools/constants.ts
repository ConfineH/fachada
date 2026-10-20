/** Dates the consolidated LAU (BOE-A-1994-26003) actually changed regime. */

/** Ley 12/2023: gestión y formalización a cargo del arrendador. Inclusive. */
export const FEE_RULE_START = "2023-05-26";

/**
 * Real Decreto-ley 29/2026, en vigor el 08/10/2026.
 * Art. 11.3 (el desistimiento no genera indemnización), art. 20.2 y art. 21.5 / 21 bis.
 */
export const REFORM_2026_START = "2026-10-08";

/**
 * El Real Decreto-ley 29/2026 está en vigor desde el 08/10/2026 y solo decae
 * si el Congreso no lo convalida (plazo hacia el 13/11/2026). En false se
 * retiran sus textos, sus reglas y el enlace al decreto.
 */
export const REFORM_2026_ACTIVE = true;
export const REFORM_2026_REVIEWED_ON = "20/10/2026";

export function reform2026Note(active: boolean) {
  return active
    ? `Norma en vigor desde el 08/10/2026, pendiente de convalidación; revisado a fecha ${REFORM_2026_REVIEWED_ON}.`
    : "El RDL 29/2026 no fue convalidado";
}

export const REFORM_2026_NOTE = reform2026Note(REFORM_2026_ACTIVE);

export function reform2026Applies(date?: string, active = REFORM_2026_ACTIVE) {
  if (!active) return false;
  if (!date) return true;
  return date >= REFORM_2026_START;
}

export function reformStatuteLinks(active: boolean) {
  return active
    ? [{ href: BOE_RDL_29_2026, label: "Real Decreto-ley 29/2026" }]
    : [];
}

/** LEC: juicio verbal sin abogado ni procurador si la cuantía no excede de este importe. */
export const LAWYER_FREE_MAX_EUR = 2000;

export const MIN_STAY_MONTHS = 6;
export const NOTICE_DAYS = 30;

export const BOE_LAU = "https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003";
export const BOE_LEY_12_2023 = "https://www.boe.es/buscar/act.php?id=BOE-A-2023-12203";
export const BOE_RDL_29_2026 = "https://www.boe.es/buscar/act.php?id=BOE-A-2026-20823";

export const BOE_ART = {
  fees: `${BOE_LAU}#a20`,
  deposit: `${BOE_LAU}#a36`,
  repairs: `${BOE_LAU}#a21`,
  earlyExit: `${BOE_LAU}#a11`,
  rent: `${BOE_LAU}#a18`,
} as const;

/** Textos de las herramientas nuevas, revisados sobre el BOE consolidado. */
export const TOOL_TEXTS_REVIEWED_ON = "21/10/2026";

/**
 * Tope de la disposición final sexta del RDL 29/2026 cuando la renta no supera
 * el índice de precios de referencia y no hay un pacto nuevo.
 */
export const EXTRAORDINARY_RENT_CAP = 2;
export const EXTRAORDINARY_RENT_END = "2027-12-31";

/** Serie IRAV1 del INE. El script `update-irav` reescribe la fecha y la tabla. */
export const IRAV_SOURCE_URL = "https://www.ine.es/consul/serie.do?d=true&s=IRAV1";
export const IRAV_API_URL =
  "https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/IRAV1?nult=36";

export type IravRow = {
  /** Mes de referencia, YYYY-MM. No es la fecha de publicación. */
  month: string;
  /** Variación anual en porcentaje, tal como la publica el INE. */
  value: number;
  source: string;
  /** YYYY-MM-DD en que esta fila se escribió en el repositorio. */
  loadedOn: string;
};

/** YYYY-MM-DD. El script update-irav reescribe esta constante. */
export const IRAV_LOADED_ON = "2026-10-21";

// IRAV_TABLE_START
export const IRAV_TABLE: readonly IravRow[] = [
  { month: "2024-11", value: 2.2, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2024-12", value: 2.28, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-01", value: 2.19, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-02", value: 2.08, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-03", value: 1.98, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-04", value: 2.09, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-05", value: 1.99, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-06", value: 2.1, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-07", value: 2.15, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-08", value: 2.19, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-09", value: 2.22, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-10", value: 2.25, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-11", value: 2.29, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2025-12", value: 2.32, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2026-01", value: 2.14, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2026-02", value: 2.16, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2026-03", value: 2.47, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2026-04", value: 2.4, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2026-05", value: 2.48, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2026-06", value: 2.44, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2026-07", value: 2.49, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2026-08", value: 2.47, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
  { month: "2026-09", value: 2.54, source: IRAV_SOURCE_URL, loadedOn: "2026-10-21" },
];
// IRAV_TABLE_END

export const CONTRACT_KINDS = ["vivienda", "temporada", "habitacion"] as const;
export type ContractKind = (typeof CONTRACT_KINDS)[number];
