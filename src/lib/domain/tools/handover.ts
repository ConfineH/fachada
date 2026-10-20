export const HANDOVER_MODES = ["entrada", "salida"] as const;
export type HandoverMode = (typeof HANDOVER_MODES)[number];

export const ITEM_CONDITIONS = ["bien", "desgaste", "danado"] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  bien: "Bien",
  desgaste: "Desgaste normal",
  danado: "Dañado",
};

export const ACTA_EXPORT_KIND = "fachada-acta-v1" as const;

export const HASH_NOT_TIMESTAMP =
  "Este código resume el contenido del acta (SHA-256). No es un sello de tiempo oficial ni prueba la fecha ante terceros.";

export type ActaPhoto = {
  id: string;
  name: string;
  sha256: string;
  dataUrl: string;
};

export type ActaElement = {
  id: string;
  name: string;
  condition: ItemCondition;
  note: string;
  photos: ActaPhoto[];
};

export type ActaRoom = {
  id: string;
  name: string;
  elements: ActaElement[];
};

export type HandoverActa = {
  mode: HandoverMode;
  address: string;
  date: string;
  time: string;
  landlordName: string;
  tenantName: string;
  meters: { luz: string; agua: string; gas: string };
  keys: number | null;
  remotes: number | null;
  rooms: ActaRoom[];
  landlordSignature: string | null;
  tenantSignature: string | null;
};

export type ActaFile = {
  kind: typeof ACTA_EXPORT_KIND;
  exportedAt: string;
  contentHash: string;
  acta: HandoverActa;
};

export const ROOM_PRESETS: ReadonlyArray<{ name: string; elements: readonly string[] }> = [
  { name: "Salón", elements: ["Paredes", "Suelo", "Ventanas", "Puertas"] },
  { name: "Cocina", elements: ["Encimera", "Fregadero y grifo", "Electrodomésticos", "Alicatado"] },
  { name: "Baño", elements: ["Sanitarios", "Grifería", "Alicatado", "Suelo"] },
  { name: "Dormitorio", elements: ["Paredes", "Suelo", "Ventanas", "Armarios"] },
];

export function emptyActa(mode: HandoverMode = "entrada"): HandoverActa {
  return {
    mode,
    address: "",
    date: "",
    time: "",
    landlordName: "",
    tenantName: "",
    meters: { luz: "", agua: "", gas: "" },
    keys: null,
    remotes: null,
    rooms: [],
    landlordSignature: null,
    tenantSignature: null,
  };
}

export function roomFromPreset(
  preset: { name: string; elements: readonly string[] },
  nextId: () => string,
): ActaRoom {
  return {
    id: nextId(),
    name: preset.name,
    elements: preset.elements.map((name) => ({
      id: nextId(),
      name,
      condition: "bien",
      note: "",
      photos: [],
    })),
  };
}

export function cloneActa(acta: HandoverActa): HandoverActa {
  return structuredClone(acta);
}

/**
 * El art. 21.4 pone las pequeñas reparaciones del uso ordinario a cargo del
 * inquilino. El deterioro por el tiempo, sin culpa, no es un daño que retenga
 * la fianza (art. 21.1, que remite a los arts. 1563 y 1564 del Código Civil, y
 * art. 36). El 36.7 solo se explica si el RDL 29/2026 sigue en vigor.
 */
export function handoverLegalNotes(reformActive: boolean): string[] {
  const notes = [
    "El artículo 21.1 de la LAU obliga al arrendador a conservar la vivienda en condiciones de habitabilidad, salvo que el deterioro sea imputable al arrendatario. El artículo 21.4 deja a cargo del arrendatario las pequeñas reparaciones que exija el desgaste por el uso ordinario.",
    "El deterioro que produce el tiempo, sin culpa del inquilino, no es un desperfecto para retener la fianza. Así lo indican los artículos 1.563 y 1.564 del Código Civil, a los que remite el 21.1, y el artículo 36 de la LAU, que regula la devolución.",
  ];
  if (reformActive) {
    notes.push(
      "Desde el 8 de octubre de 2026, el artículo 36.7 exige dejar constancia del estado en un documento de finalización del contrato, firmado por las dos partes. Si no se firma, o no se anota ningún desperfecto, se presume, salvo prueba en contrario, que la vivienda se devolvió en buen estado.",
    );
  }
  return notes;
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(",")}}`;
}

export async function actaContentHash(acta: HandoverActa): Promise<string> {
  const canonical = {
    address: acta.address.trim(),
    date: acta.date,
    keys: acta.keys,
    landlordName: acta.landlordName.trim(),
    landlordSignatureSha256: acta.landlordSignature ? await sha256Hex(acta.landlordSignature) : null,
    meters: {
      agua: acta.meters.agua.trim(),
      gas: acta.meters.gas.trim(),
      luz: acta.meters.luz.trim(),
    },
    mode: acta.mode,
    remotes: acta.remotes,
    rooms: acta.rooms.map((room) => ({
      elements: room.elements.map((element) => ({
        condition: element.condition,
        id: element.id,
        name: element.name.trim(),
        note: element.note.trim(),
        photos: element.photos.map((photo) => ({
          id: photo.id,
          name: photo.name,
          sha256: photo.sha256,
        })),
      })),
      id: room.id,
      name: room.name.trim(),
    })),
    tenantName: acta.tenantName.trim(),
    tenantSignatureSha256: acta.tenantSignature ? await sha256Hex(acta.tenantSignature) : null,
    time: acta.time,
  };
  return sha256Hex(stableStringify(canonical));
}

export type HandoverChange = {
  room: string;
  element: string;
  field: "estado" | "nota" | "fotos" | "estancia" | "contadores" | "llaves" | "mandos" | "direccion" | "partes";
  before: string;
  after: string;
};

function namesMatch(left: string, right: string) {
  return left.trim().toLocaleLowerCase("es") === right.trim().toLocaleLowerCase("es");
}

function pairByIdThenName<T extends { id: string; name: string }>(
  before: T[],
  after: T[],
): Array<{ before: T | null; after: T | null }> {
  const usedAfter = new Set<string>();
  const pairs: Array<{ before: T | null; after: T | null }> = [];
  const leftover: T[] = [];

  for (const item of before) {
    const match = after.find((candidate) => candidate.id === item.id && !usedAfter.has(candidate.id));
    if (match) {
      usedAfter.add(match.id);
      pairs.push({ before: item, after: match });
    } else {
      leftover.push(item);
    }
  }

  const still: T[] = [];
  for (const item of leftover) {
    const match = after.find(
      (candidate) => !usedAfter.has(candidate.id) && namesMatch(candidate.name, item.name),
    );
    if (match) {
      usedAfter.add(match.id);
      pairs.push({ before: item, after: match });
    } else {
      still.push(item);
    }
  }

  for (const item of still) pairs.push({ before: item, after: null });
  for (const item of after) {
    if (!usedAfter.has(item.id)) pairs.push({ before: null, after: item });
  }
  return pairs;
}

export function diffHandover(before: HandoverActa, after: HandoverActa): HandoverChange[] {
  const changes: HandoverChange[] = [];
  const push = (
    field: HandoverChange["field"],
    room: string,
    element: string,
    previous: string,
    next: string,
  ) => {
    if (previous !== next) changes.push({ field, room, element, before: previous, after: next });
  };

  push("direccion", "", "", before.address.trim(), after.address.trim());
  push(
    "partes",
    "",
    "",
    `${before.landlordName.trim()} / ${before.tenantName.trim()}`,
    `${after.landlordName.trim()} / ${after.tenantName.trim()}`,
  );
  push("contadores", "", "Luz", before.meters.luz.trim(), after.meters.luz.trim());
  push("contadores", "", "Agua", before.meters.agua.trim(), after.meters.agua.trim());
  push("contadores", "", "Gas", before.meters.gas.trim(), after.meters.gas.trim());
  push("llaves", "", "", String(before.keys ?? ""), String(after.keys ?? ""));
  push("mandos", "", "", String(before.remotes ?? ""), String(after.remotes ?? ""));

  for (const pair of pairByIdThenName(before.rooms, after.rooms)) {
    if (!pair.before && pair.after) {
      push("estancia", pair.after.name, "", "No estaba", "Estancia nueva");
      continue;
    }
    if (pair.before && !pair.after) {
      push("estancia", pair.before.name, "", "Estaba", "Ya no está");
      continue;
    }
    if (!pair.before || !pair.after) continue;
    for (const elements of pairByIdThenName(pair.before.elements, pair.after.elements)) {
      const room = pair.after.name;
      if (!elements.before && elements.after) {
        push(
          "estancia",
          room,
          elements.after.name,
          "No estaba",
          CONDITION_LABELS[elements.after.condition],
        );
        continue;
      }
      if (elements.before && !elements.after) {
        push("estancia", room, elements.before.name, CONDITION_LABELS[elements.before.condition], "Ya no está");
        continue;
      }
      if (!elements.before || !elements.after) continue;
      push(
        "estado",
        room,
        elements.after.name,
        CONDITION_LABELS[elements.before.condition],
        CONDITION_LABELS[elements.after.condition],
      );
      push("nota", room, elements.after.name, elements.before.note.trim(), elements.after.note.trim());
      push(
        "fotos",
        room,
        elements.after.name,
        String(elements.before.photos.length),
        String(elements.after.photos.length),
      );
    }
  }

  return changes;
}

function isCondition(value: unknown): value is ItemCondition {
  return value === "bien" || value === "desgaste" || value === "danado";
}

function isActa(value: unknown): value is HandoverActa {
  if (!value || typeof value !== "object") return false;
  const acta = value as HandoverActa;
  return (
    (acta.mode === "entrada" || acta.mode === "salida") &&
    typeof acta.address === "string" &&
    typeof acta.date === "string" &&
    typeof acta.time === "string" &&
    Array.isArray(acta.rooms) &&
    acta.rooms.every(
      (room) =>
        room &&
        typeof room.id === "string" &&
        typeof room.name === "string" &&
        Array.isArray(room.elements) &&
        room.elements.every(
          (element) =>
            element &&
            typeof element.id === "string" &&
            typeof element.name === "string" &&
            isCondition(element.condition) &&
            typeof element.note === "string" &&
            Array.isArray(element.photos),
        ),
    )
  );
}

export function parseActaFile(raw: unknown): ActaFile | null {
  if (!raw || typeof raw !== "object") return null;
  const file = raw as ActaFile;
  if (file.kind !== ACTA_EXPORT_KIND || typeof file.contentHash !== "string" || !isActa(file.acta)) {
    return null;
  }
  return file;
}

export async function verifyActaFile(
  file: ActaFile,
): Promise<"match" | "mismatch"> {
  const hash = await actaContentHash(file.acta);
  return hash === file.contentHash ? "match" : "mismatch";
}

export const ACTA_DEPOSIT_STORAGE_KEY = "fachada.acta.deposit";

export type ActaDepositDraft = {
  landlordName: string;
  tenantName: string;
  address: string;
  keysDate: string;
  deductionDetail: string;
};

export function depositDraftFromActa(acta: HandoverActa): ActaDepositDraft {
  const damaged: string[] = [];
  for (const room of acta.rooms) {
    for (const element of room.elements) {
      if (element.condition !== "danado") continue;
      const note = element.note.trim();
      damaged.push(note ? `${room.name}: ${element.name} (${note})` : `${room.name}: ${element.name}`);
    }
  }
  return {
    landlordName: acta.landlordName.trim(),
    tenantName: acta.tenantName.trim(),
    address: acta.address.trim(),
    keysDate: acta.date,
    deductionDetail: damaged.join("; ").slice(0, 300),
  };
}

export function parseActaDepositDraft(raw: string): ActaDepositDraft | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ActaDepositDraft>;
    if (typeof parsed.address !== "string" || typeof parsed.tenantName !== "string") return null;
    if (!parsed.address.trim() || !parsed.tenantName.trim()) return null;
    return {
      landlordName: typeof parsed.landlordName === "string" ? parsed.landlordName : "",
      tenantName: parsed.tenantName,
      address: parsed.address,
      keysDate: typeof parsed.keysDate === "string" ? parsed.keysDate : "",
      deductionDetail: typeof parsed.deductionDetail === "string" ? parsed.deductionDetail : "",
    };
  } catch {
    return null;
  }
}
