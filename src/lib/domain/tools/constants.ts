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
} as const;

export const CONTRACT_KINDS = ["vivienda", "temporada", "habitacion"] as const;
export type ContractKind = (typeof CONTRACT_KINDS)[number];
