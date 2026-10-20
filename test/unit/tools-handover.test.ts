import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { toolById } from "@/lib/domain/tools/catalog";
import {
  ACTA_EXPORT_KIND,
  actaContentHash,
  depositDraftFromActa,
  diffHandover,
  emptyActa,
  handoverLegalNotes,
  parseActaDepositDraft,
  parseActaFile,
  roomFromPreset,
  ROOM_PRESETS,
  sha256Hex,
  verifyActaFile,
  type ActaFile,
  type HandoverActa,
} from "@/lib/domain/tools/handover";
import { buildActaPdf } from "@/lib/tools/acta-pdf";

function sample(): HandoverActa {
  let n = 0;
  const next = () => `id-${++n}`;
  const acta = emptyActa("entrada");
  acta.address = "Calle Mayor 1";
  acta.date = "2026-10-21";
  acta.time = "10:30";
  acta.landlordName = "Ana Ruiz";
  acta.tenantName = "Luis Pérez";
  acta.meters = { luz: "100", agua: "20", gas: "5" };
  acta.keys = 3;
  acta.remotes = 1;
  acta.rooms = [roomFromPreset(ROOM_PRESETS[0]!, next)];
  return acta;
}

describe("handover acta", () => {
  it("hides the end-of-contract presumption unless the 2026 reform is active", () => {
    expect(handoverLegalNotes(false).join(" ")).not.toContain("36.7");
    expect(handoverLegalNotes(false).join(" ")).not.toContain("documento de finalización");
    expect(handoverLegalNotes(true).join(" ")).toContain("36.7");
    expect(handoverLegalNotes(true).join(" ")).toContain("se presume");
    expect(handoverLegalNotes(false).join(" ")).toContain("21.4");
    const tool = toolById("acta-entrega-llaves");
    expect(tool.description.toLowerCase()).toContain("acta entrega llaves alquiler");
    expect(tool.articleNote).toContain("21/10/2026");
  });

  it("shows what changed, matching by id and then by name", () => {
    const before = sample();
    const after = structuredClone(before);
    after.mode = "salida";
    after.rooms[0]!.elements[0]!.condition = "danado";
    after.rooms[0]!.elements[0]!.note = "Grieta";
    after.meters.luz = "140";
    const changes = diffHandover(before, after);
    expect(changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "estado", before: "Bien", after: "Dañado" }),
        expect.objectContaining({ field: "nota", after: "Grieta" }),
        expect.objectContaining({ field: "contadores", element: "Luz", after: "140" }),
      ]),
    );

    const renamed = structuredClone(after);
    renamed.rooms[0]!.id = "otra";
    renamed.rooms[0]!.elements[0]!.id = "otro";
    expect(diffHandover(before, renamed).some((change) => change.field === "estado")).toBe(true);
  });

  it("reports added and removed rooms", () => {
    const before = sample();
    const after = structuredClone(before);
    after.rooms = [];
    expect(diffHandover(before, after)).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "estancia", after: "Ya no está" })]),
    );
    const added = structuredClone(before);
    added.rooms.push({ id: "nuevo", name: "Trastero", elements: [] });
    expect(diffHandover(before, added)).toEqual(
      expect.arrayContaining([expect.objectContaining({ room: "Trastero", after: "Estancia nueva" })]),
    );
  });

  it("hashes the content, not the photo bytes, and changes when a signature changes", async () => {
    const acta = sample();
    acta.rooms[0]!.elements[0]!.photos = [
      { id: "p1", name: "pared.jpg", sha256: "abc", dataUrl: "data:image/jpeg;base64,AAAA" },
    ];
    const first = await actaContentHash(acta);
    const swapped = structuredClone(acta);
    swapped.rooms[0]!.elements[0]!.photos[0]!.dataUrl = "data:image/jpeg;base64,BBBB";
    expect(await actaContentHash(swapped)).toBe(first);
    swapped.rooms[0]!.elements[0]!.photos[0]!.sha256 = "def";
    expect(await actaContentHash(swapped)).not.toBe(first);
    acta.tenantSignature = "data:image/png;base64,firma";
    expect(await actaContentHash(acta)).not.toBe(first);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("checks the exported file and keeps damaged items for the deposit letter", async () => {
    const acta = sample();
    acta.rooms[0]!.elements[1]!.condition = "danado";
    acta.rooms[0]!.elements[1]!.note = "Mancha";
    const file: ActaFile = {
      kind: ACTA_EXPORT_KIND,
      exportedAt: "2026-10-21T10:30:00.000Z",
      contentHash: await actaContentHash(acta),
      acta,
    };
    expect(parseActaFile(file)?.contentHash).toBe(file.contentHash);
    expect(await verifyActaFile(file)).toBe("match");
    expect(await verifyActaFile({ ...file, contentHash: "0".repeat(64) })).toBe("mismatch");
    expect(parseActaFile({ ...file, kind: "otro" })).toBeNull();

    const draft = depositDraftFromActa(acta);
    expect(draft.deductionDetail).toContain("Suelo");
    expect(draft.deductionDetail).toContain("Mancha");
    expect(draft.deductionDetail).not.toContain("Paredes");
    expect(parseActaDepositDraft(JSON.stringify(draft))?.address).toBe("Calle Mayor 1");
    expect(parseActaDepositDraft("{}")).toBeNull();
  });

  it("puts the hash and the timestamp warning in the PDF", async () => {
    const acta = sample();
    const hash = await sha256Hex("acta");
    const bytes = await buildActaPdf(acta, hash);
    const raw = Buffer.from(bytes);
    expect(raw.subarray(0, 5).toString()).toBe("%PDF-");
    const start = raw.indexOf("stream\n") + "stream\n".length;
    const end = raw.indexOf("\nendstream");
    const text = inflateSync(raw.subarray(start, end))
      .toString("latin1")
      .replace(/<([0-9A-Fa-f]+)>/g, (_, hex: string) =>
        hex
          .match(/../g)!
          .map((pair) => String.fromCharCode(Number.parseInt(pair, 16)))
          .join(""),
      );
    expect(text).toContain(hash);
    expect(text).toContain("No es un sello de tiempo oficial");
  });
});
