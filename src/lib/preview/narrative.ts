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

export const AUTHENTICITY_LABELS = [
  "Es una experiencia propia y distingue hechos de opiniones.",
  "No he recibido un incentivo por publicarla.",
  "No tengo un conflicto de interés.",
  "Acepto las normas y he leído la privacidad.",
] as const;
