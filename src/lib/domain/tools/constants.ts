/** Dates the consolidated LAU (BOE-A-1994-26003) actually changed regime. */

/** Ley 12/2023: gestión y formalización a cargo del arrendador. Inclusive. */
export const FEE_RULE_START = "2023-05-26";

/**
 * Real Decreto-ley 29/2026, en vigor el 08/10/2026.
 * Art. 11.3 (el desistimiento no genera indemnización), art. 20.2 y art. 21.5 / 21 bis.
 */
export const REFORM_2026_START = "2026-10-08";

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
} as const;

export const CONTRACT_KINDS = ["vivienda", "temporada", "habitacion"] as const;
export type ContractKind = (typeof CONTRACT_KINDS)[number];
