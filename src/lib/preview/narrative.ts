import type { IncidentTag } from "@/lib/domain/incidents";

const MIN_SIDE = 10;

export type SideMap = {
  pros: string;
  cons: string;
  omittedSide: "pros" | "cons" | null;
  inventedText: false;
  publishable: boolean;
  reason: string;
};

/**
 * Preview-only mapping. It does not change the review schema: pros and cons
 * stay the two columns. An empty side stays empty. Nothing is written to fill it.
 */
export function mapOptionalSides(input: { pros: string; cons: string }): SideMap {
  const pros = input.pros.trim();
  const cons = input.cons.trim();
  const prosOk = pros.length >= MIN_SIDE;
  const consOk = cons.length >= MIN_SIDE;

  if (prosOk && consOk) {
    return {
      pros,
      cons,
      omittedSide: null,
      inventedText: false,
      publishable: true,
      reason: "Los dos lados se guardarían como ahora, en los mismos campos.",
    };
  }
  if (prosOk && cons.length === 0) {
    return {
      pros,
      cons: "",
      omittedSide: "cons",
      inventedText: false,
      publishable: true,
      reason:
        "Solo hay ventajas. Desventajas quedaría vacío. En la ficha no se imprimiría la etiqueta vacía.",
    };
  }
  if (consOk && pros.length === 0) {
    return {
      pros: "",
      cons,
      omittedSide: "pros",
      inventedText: false,
      publishable: true,
      reason:
        "Solo hay desventajas. Ventajas quedaría vacío. No se redacta un lado positivo de relleno.",
    };
  }
  if (pros.length > 0 || cons.length > 0) {
    return {
      pros,
      cons,
      omittedSide: null,
      inventedText: false,
      publishable: false,
      reason: "El texto escrito tiene que llegar a 10 caracteres. No se completa con una frase genérica.",
    };
  }
  return {
    pros: "",
    cons: "",
    omittedSide: null,
    inventedText: false,
    publishable: false,
    reason: "Hace falta contar al menos un lado.",
  };
}

export function publicBodyFromSides(mapped: SideMap) {
  if (!mapped.publishable) return "";
  const parts: string[] = [];
  if (mapped.pros) parts.push(`Ventajas: ${mapped.pros}`);
  if (mapped.cons) parts.push(`Desventajas: ${mapped.cons}`);
  return parts.join("\n\n");
}

export type NarrativeMap = {
  title: string;
  narrative: string;
  pros: string;
  cons: string;
  incidentTags: IncidentTag[];
  body: string;
  inventedText: false;
  publishable: boolean;
  reason: string;
};

function titleFromNarrative(narrative: string) {
  const compact = narrative.trim().replace(/\s+/g, " ");
  if (compact.length <= 100) return compact;
  const cut = compact.slice(0, 100);
  const space = cut.lastIndexOf(" ");
  return (space > 40 ? cut.slice(0, space) : cut).trim();
}

/**
 * Preview mapping for a main narrative plus optional structured fields.
 * No new column: the narrative becomes the public body and the title is its
 * opening. Pros, cons and incident tags stay in the fields that already exist.
 */
export function mapNarrative(input: {
  narrative: string;
  pros: string;
  cons: string;
  incidentTags?: IncidentTag[];
}): NarrativeMap {
  const narrative = input.narrative.trim();
  const pros = input.pros.trim();
  const cons = input.cons.trim();
  const incidentTags = input.incidentTags ?? [];
  const prosPartial = pros.length > 0 && pros.length < MIN_SIDE;
  const consPartial = cons.length > 0 && cons.length < MIN_SIDE;
  const base = {
    title: narrative ? titleFromNarrative(narrative) : "",
    narrative,
    pros,
    cons,
    incidentTags,
    inventedText: false as const,
  };

  if (narrative.length < MIN_SIDE) {
    return {
      ...base,
      body: "",
      publishable: false,
      reason: "La experiencia tiene que llegar a 10 caracteres. No se completa con un texto genérico.",
    };
  }
  if (prosPartial || consPartial) {
    return {
      ...base,
      body: "",
      publishable: false,
      reason: "Un aspecto opcional, si se escribe, tiene que llegar a 10 caracteres.",
    };
  }

  const parts = [narrative];
  if (pros) parts.push(`Ventajas: ${pros}`);
  if (cons) parts.push(`Desventajas: ${cons}`);
  return {
    ...base,
    body: parts.join("\n\n"),
    publishable: true,
    reason:
      "El relato va al cuerpo y su inicio al título. Ventajas, desventajas e incidencias solo se guardan si las has marcado. No hay columna nueva.",
  };
}

export type DraftMode = "conservador" | "lados" | "narrativa";

export function draftReady(input: {
  mode: DraftMode;
  pros: string;
  cons: string;
  narrative: string;
  rating: number | null;
  declarationsAccepted: number;
  incidentTags?: IncidentTag[];
}) {
  if (input.rating === null || input.rating < 1 || input.rating > 5) {
    return { ready: false, reason: "Elige una nota del 1 al 5." };
  }
  if (input.declarationsAccepted < AUTHENTICITY_LABELS.length) {
    return { ready: false, reason: "Faltan las declaraciones de autenticidad." };
  }
  if (input.mode === "conservador") {
    const prosOk = input.pros.trim().length >= MIN_SIDE;
    const consOk = input.cons.trim().length >= MIN_SIDE;
    return prosOk && consOk
      ? { ready: true, reason: "Los dos lados y las declaraciones están." }
      : { ready: false, reason: "Hacen falta los dos textos, con al menos 10 caracteres cada uno." };
  }
  if (input.mode === "lados") {
    const mapped = mapOptionalSides(input);
    return { ready: mapped.publishable, reason: mapped.reason };
  }
  const mapped = mapNarrative(input);
  return { ready: mapped.publishable, reason: mapped.reason };
}

export const AUTHENTICITY_LABELS = [
  "Es una experiencia propia y distingue hechos de opiniones.",
  "No he recibido un incentivo por publicarla.",
  "No tengo un conflicto de interés.",
  "Acepto las normas y he leído la privacidad.",
] as const;
