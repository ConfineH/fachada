/** Primera reseña de una cuenta creada dentro de esta ventana se retiene. */
export const NEW_ACCOUNT_HOLD_MS = 24 * 60 * 60 * 1000;

export const HOLD_NEW_ACCOUNT =
  "La hemos retenido porque es la primera reseña de una cuenta recién creada. Una persona la revisará antes de que salga en la ficha.";

export const HOLD_PERSONAL_DATA =
  "La hemos retenido porque el texto incluye un teléfono, un correo, un DNI o una cuenta bancaria. Quítalo y guárdala de nuevo desde tu cuenta.";

export const HOLD_THREAT =
  "La hemos retenido porque el texto incluye una amenaza. Quítala y guárdala de nuevo desde tu cuenta.";

export const HOLD_INSULT =
  "La hemos retenido porque el texto incluye un insulto. Una crítica puede publicarse; el insulto, no. Cámbialo y guárdala de nuevo desde tu cuenta.";

export const HOLD_RESTRICTED =
  "Sigue fuera de la ficha porque ya estaba restringida. Una persona tiene que volver a publicarla.";

const INSULT_PHRASES = [
  "hijos de puta",
  "hijo de puta",
  "hija de puta",
  "hijoputa",
  "hijaputa",
];

const INSULT_WORDS = [
  "gilipollas",
  "subnormal",
  "cabron",
  "cabrona",
  "cabrones",
  "imbecil",
  "imbeciles",
  "puta",
  "puto",
  "putas",
  "putos",
  "zorra",
  "zorras",
  "maricon",
  "maricones",
  "capullo",
  "capullos",
];

const THREAT_PATTERNS = [
  /\b(?:te|os|les|la|lo)\s+mato\b/,
  /\bvoy a matar(?:te|os|los|las)?\b/,
  /\b(?:te|os|les)\s+reviento\b/,
  /\bvoy a reventar(?:te|os)?\b/,
  /\bparto la cara\b/,
  /\bvoy a quemar\b/,
  /\bpaliza\b/,
  /\b(?:te|os)\s+voy a (?:pegar|matar|quemar|reventar|partir)\b/,
];

export type ReviewPublication =
  | { publish: true }
  | { publish: false; reason: string; keepFlagged?: boolean };

export function isRecentAccount(createdAt: Date, now = new Date()) {
  return now.getTime() - createdAt.getTime() < NEW_ACCOUNT_HOLD_MS;
}

export function textHoldReason(text: string): string | null {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (containsPersonalData(normalized)) return HOLD_PERSONAL_DATA;
  if (THREAT_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return HOLD_THREAT;
  }
  if (containsInsult(normalized)) return HOLD_INSULT;
  return null;
}

export function initialPublication(input: {
  text: string;
  accountCreatedAt: Date;
  hasPriorReview: boolean;
  now?: Date;
}): ReviewPublication {
  const held = textHoldReason(input.text);
  if (held) return { publish: false, reason: held };
  if (
    !input.hasPriorReview &&
    isRecentAccount(input.accountCreatedAt, input.now)
  ) {
    return { publish: false, reason: HOLD_NEW_ACCOUNT };
  }
  return { publish: true };
}

export function editPublication(input: {
  text: string;
  wasFlagged: boolean;
  wasPublic: boolean;
  accountCreatedAt: Date;
  hasOtherReview: boolean;
  now?: Date;
}): ReviewPublication {
  const held = textHoldReason(input.text);
  if (held) return { publish: false, reason: held };
  if (input.wasFlagged) {
    return { publish: false, reason: HOLD_RESTRICTED, keepFlagged: true };
  }
  if (
    !input.wasPublic &&
    !input.hasOtherReview &&
    isRecentAccount(input.accountCreatedAt, input.now)
  ) {
    return { publish: false, reason: HOLD_NEW_ACCOUNT };
  }
  return { publish: true };
}

function containsPersonalData(text: string) {
  return (
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(text) ||
    /\b\d{8}\s?[a-z]\b/.test(text) ||
    /\b[xyz]\d{7}\s?[a-z]\b/.test(text) ||
    /\bes\d{2}(?:[\s-]?\d{4}){5}\b/.test(text) ||
    /(?:\+34|0034)[\s.-]?[6-9](?:[\s.-]?\d){8}/.test(text) ||
    /\b[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b/.test(text)
  );
}

function containsInsult(text: string) {
  if (INSULT_PHRASES.some((phrase) => text.includes(phrase))) return true;
  return INSULT_WORDS.some((word) =>
    new RegExp(`(?:^|[^a-z])${word}(?:[^a-z]|$)`).test(text),
  );
}
