"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Field } from "@/components/tools/fields";
import { SignaturePad } from "@/components/tools/signature-pad";
import { REFORM_2026_ACTIVE, TOOL_TEXTS_REVIEWED_ON } from "@/lib/domain/tools/constants";
import {
  ACTA_DEPOSIT_STORAGE_KEY,
  ACTA_EXPORT_KIND,
  CONDITION_LABELS,
  HASH_NOT_TIMESTAMP,
  ROOM_PRESETS,
  actaContentHash,
  cloneActa,
  depositDraftFromActa,
  diffHandover,
  emptyActa,
  handoverLegalNotes,
  parseActaFile,
  roomFromPreset,
  sha256Hex,
  verifyActaFile,
  type ActaElement,
  type ActaPhoto,
  type HandoverActa,
  type HandoverChange,
  type HandoverMode,
  type ItemCondition,
} from "@/lib/domain/tools/handover";
import { buildActaPdf } from "@/lib/tools/acta-pdf";
import { loadActaBaseline, loadActaDraft, saveActaBaseline, saveActaDraft } from "@/lib/tools/acta-store";

const FIELD_LABEL: Record<HandoverChange["field"], string> = {
  estado: "Estado",
  nota: "Nota",
  fotos: "Fotos",
  estancia: "Estancia",
  contadores: "Contador",
  llaves: "Llaves",
  mandos: "Mandos",
  direccion: "Dirección",
  partes: "Partes",
};

export function HandoverTool() {
  const [acta, setActa] = useState<HandoverActa>(() => emptyActa());
  const [baseline, setBaseline] = useState<HandoverActa | null>(null);
  const [ready, setReady] = useState(false);
  const [integrity, setIntegrity] = useState<"match" | "mismatch" | null>(null);
  const [importError, setImportError] = useState("");
  const [busy, setBusy] = useState<"pdf" | "json" | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadActaDraft().catch(() => null), loadActaBaseline().catch(() => null)]).then(
      ([draft, storedBaseline]) => {
        if (cancelled) return;
        if (draft) setActa(draft);
        else {
          setActa({
            ...emptyActa(),
            rooms: ROOM_PRESETS.map((preset) => roomFromPreset(preset, () => crypto.randomUUID())),
          });
        }
        if (storedBaseline) setBaseline(storedBaseline);
        setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const handle = window.setTimeout(() => {
      void saveActaDraft(acta).catch(() => undefined);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [acta, ready]);

  function patch(partial: Partial<HandoverActa>) {
    setActa((current) => ({ ...current, ...partial }));
  }

  function updateElement(roomId: string, elementId: string, partial: Partial<ActaElement>) {
    setActa((current) => ({
      ...current,
      rooms: current.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              elements: room.elements.map((element) =>
                element.id === elementId ? { ...element, ...partial } : element,
              ),
            }
          : room,
      ),
    }));
  }

  async function addPhotos(roomId: string, elementId: string, files: FileList | null) {
    if (!files?.length) return;
    const photos: ActaPhoto[] = [];
    for (const file of files) {
      const dataUrl = await shrinkToJpeg(file);
      photos.push({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^.]+$/, "") + ".jpg",
        sha256: await sha256Hex(dataUrl),
        dataUrl,
      });
    }
    setActa((current) => ({
      ...current,
      rooms: current.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              elements: room.elements.map((element) =>
                element.id === elementId ? { ...element, photos: [...element.photos, ...photos] } : element,
              ),
            }
          : room,
      ),
    }));
  }

  async function exportJson() {
    setBusy("json");
    try {
      const contentHash = await actaContentHash(acta);
      const file = {
        kind: ACTA_EXPORT_KIND,
        exportedAt: new Date().toISOString(),
        contentHash,
        acta,
      };
      download(
        `acta-${acta.mode}.json`,
        new Blob([JSON.stringify(file)], { type: "application/json" }),
      );
    } finally {
      setBusy(null);
    }
  }

  async function exportPdf() {
    setBusy("pdf");
    try {
      const hash = await actaContentHash(acta);
      const bytes = await buildActaPdf(acta, hash);
      download(`acta-${acta.mode}.pdf`, new Blob([Uint8Array.from(bytes)], { type: "application/pdf" }));
    } finally {
      setBusy(null);
    }
  }

  async function importEntry(file: File | undefined) {
    setImportError("");
    setIntegrity(null);
    if (!file) return;
    try {
      const parsed = parseActaFile(JSON.parse(await file.text()));
      if (!parsed) {
        setImportError("Ese archivo no es un acta exportada desde Fachada.");
        return;
      }
      const check = await verifyActaFile(parsed);
      setIntegrity(check);
      setBaseline(parsed.acta);
      await saveActaBaseline(parsed.acta).catch(() => undefined);
      setActa({
        ...cloneActa(parsed.acta),
        mode: "salida",
        landlordSignature: null,
        tenantSignature: null,
      });
    } catch {
      setImportError("No se ha podido leer el archivo.");
    }
  }

  const changes = acta.mode === "salida" && baseline ? diffHandover(baseline, acta) : [];
  const notes = handoverLegalNotes(REFORM_2026_ACTIVE);

  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500">Texto legal revisado el {TOOL_TEXTS_REVIEWED_ON}.</p>
      <p className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-700">
        Las fotos, las firmas y el acta se quedan en este dispositivo. Fachada no las envía a ningún servidor.
      </p>

      <div className="card-raised space-y-5 p-5 sm:p-6">
        <fieldset>
          <legend className="text-sm font-medium text-zinc-800">Momento</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["entrada", "Entrada al piso"],
                ["salida", "Salida del piso"],
              ] as const
            ).map(([mode, label]) => (
              <label key={mode} className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-300 bg-white px-3 text-sm">
                <input
                  type="radio"
                  name="handover-mode"
                  checked={acta.mode === mode}
                  onChange={() => patch({ mode: mode satisfies HandoverMode })}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {acta.mode === "salida" ? (
          <Field label="Acta de entrada" hint="El archivo JSON exportado al entrar. Sirve para ver qué ha cambiado.">
            <input
              className="input-field min-h-11"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void importEntry(event.target.files?.[0])}
            />
          </Field>
        ) : null}
        {importError ? <p className="text-sm text-amber-800">{importError}</p> : null}
        {integrity === "mismatch" ? (
          <p className="text-sm text-amber-800">
            El código de integridad del archivo no coincide. Puedes compararlo, pero alguien ha podido modificarlo.
          </p>
        ) : null}

        <Field label="Dirección">
          <input className="input-field min-h-11" value={acta.address} onChange={(event) => patch({ address: event.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Arrendador">
            <input className="input-field min-h-11" value={acta.landlordName} onChange={(event) => patch({ landlordName: event.target.value })} />
          </Field>
          <Field label="Arrendatario">
            <input className="input-field min-h-11" value={acta.tenantName} onChange={(event) => patch({ tenantName: event.target.value })} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha">
            <input className="input-field min-h-11" type="date" value={acta.date} onChange={(event) => patch({ date: event.target.value })} />
          </Field>
          <Field label="Hora">
            <input className="input-field min-h-11" type="time" value={acta.time} onChange={(event) => patch({ time: event.target.value })} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Luz">
            <input className="input-field min-h-11" value={acta.meters.luz} onChange={(event) => patch({ meters: { ...acta.meters, luz: event.target.value } })} />
          </Field>
          <Field label="Agua">
            <input className="input-field min-h-11" value={acta.meters.agua} onChange={(event) => patch({ meters: { ...acta.meters, agua: event.target.value } })} />
          </Field>
          <Field label="Gas">
            <input className="input-field min-h-11" value={acta.meters.gas} onChange={(event) => patch({ meters: { ...acta.meters, gas: event.target.value } })} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Llaves">
            <input
              className="input-field min-h-11"
              inputMode="numeric"
              value={acta.keys ?? ""}
              onChange={(event) => patch({ keys: countOrNull(event.target.value) })}
            />
          </Field>
          <Field label="Mandos">
            <input
              className="input-field min-h-11"
              inputMode="numeric"
              value={acta.remotes ?? ""}
              onChange={(event) => patch({ remotes: countOrNull(event.target.value) })}
            />
          </Field>
        </div>
      </div>

      {acta.rooms.map((room) => (
        <section key={room.id} className="card-raised space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{room.name}</h2>
            <button
              type="button"
              className="btn-secondary min-h-11 px-3"
              onClick={() => patch({ rooms: acta.rooms.filter((entry) => entry.id !== room.id) })}
            >
              Quitar
            </button>
          </div>
          {room.elements.map((element) => (
            <div key={element.id} className="space-y-3 rounded-lg border border-stone-200 p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <p className="text-sm font-medium">{element.name}</p>
                <select
                  className="input-field min-h-11"
                  aria-label={`Estado de ${element.name}`}
                  value={element.condition}
                  onChange={(event) =>
                    updateElement(room.id, element.id, { condition: event.target.value as ItemCondition })
                  }
                >
                  {(Object.keys(CONDITION_LABELS) as ItemCondition[]).map((condition) => (
                    <option key={condition} value={condition}>
                      {CONDITION_LABELS[condition]}
                    </option>
                  ))}
                </select>
              </div>
              <input
                className="input-field min-h-11"
                aria-label={`Nota de ${element.name}`}
                placeholder="Nota"
                value={element.note}
                onChange={(event) => updateElement(room.id, element.id, { note: event.target.value })}
              />
              <label className="block text-sm">
                Fotos, solo en este dispositivo
                <input
                  className="input-field mt-1 min-h-11"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    void addPhotos(room.id, element.id, event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
              {element.photos.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {element.photos.map((photo) => (
                    <li key={photo.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.dataUrl} alt={photo.name} className="h-20 w-20 rounded-md object-cover" />
                      <button
                        type="button"
                        className="mt-1 text-xs underline"
                        onClick={() =>
                          updateElement(room.id, element.id, {
                            photos: element.photos.filter((entry) => entry.id !== photo.id),
                          })
                        }
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary min-h-11"
            onClick={() =>
              patch({
                rooms: acta.rooms.map((entry) =>
                  entry.id === room.id
                    ? {
                        ...entry,
                        elements: [
                          ...entry.elements,
                          { id: crypto.randomUUID(), name: "Otro", condition: "bien", note: "", photos: [] },
                        ],
                      }
                    : entry,
                ),
              })
            }
          >
            Añadir elemento
          </button>
        </section>
      ))}

      <div className="flex flex-wrap gap-2">
        {ROOM_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className="btn-secondary min-h-11"
            onClick={() =>
              patch({ rooms: [...acta.rooms, roomFromPreset(preset, () => crypto.randomUUID())] })
            }
          >
            Añadir {preset.name.toLocaleLowerCase("es")}
          </button>
        ))}
      </div>

      <div className="card-raised space-y-5 p-5 sm:p-6">
        <SignaturePad
          label="Firma del arrendador"
          value={acta.landlordSignature}
          onChange={(landlordSignature) => patch({ landlordSignature })}
        />
        <SignaturePad
          label="Firma del arrendatario"
          value={acta.tenantSignature}
          onChange={(tenantSignature) => patch({ tenantSignature })}
        />
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-zinc-700">
        {notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
        <p>{HASH_NOT_TIMESTAMP}</p>
      </div>

      {acta.mode === "salida" && baseline ? (
        <section className="card-raised space-y-3 p-5">
          <h2 className="text-lg font-semibold">Qué ha cambiado</h2>
          {changes.length === 0 ? (
            <p className="text-sm text-zinc-600">No hay cambios respecto al acta de entrada.</p>
          ) : (
            <ul className="space-y-3">
              {changes.map((change, index) => (
                <li key={`${change.field}-${change.room}-${change.element}-${index}`} className="text-sm">
                  <p className="font-medium">
                    {FIELD_LABEL[change.field]}
                    {change.room ? ` · ${change.room}` : ""}
                    {change.element ? ` · ${change.element}` : ""}
                  </p>
                  <div className="mt-1 grid gap-2 sm:grid-cols-2">
                    <p className="rounded-md bg-stone-50 px-3 py-2">Entrada: {change.before || "—"}</p>
                    <p className="rounded-md bg-stone-50 px-3 py-2">Salida: {change.after || "—"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary min-h-11" disabled={busy !== null} onClick={() => void exportPdf()}>
          {busy === "pdf" ? "Preparando PDF…" : "Descargar PDF"}
        </button>
        <button type="button" className="btn-secondary min-h-11" disabled={busy !== null} onClick={() => void exportJson()}>
          {busy === "json" ? "Preparando archivo…" : "Exportar archivo"}
        </button>
        <Link
          href="/herramientas/fianza"
          className="btn-secondary inline-flex min-h-11 items-center"
          onClick={() => {
            sessionStorage.setItem(ACTA_DEPOSIT_STORAGE_KEY, JSON.stringify(depositDraftFromActa(acta)));
          }}
        >
          Usar estos datos en la carta de la fianza
        </Link>
      </div>
    </div>
  );
}

function countOrNull(raw: string): number | null {
  if (raw.trim() === "") return null;
  if (!/^\d{1,3}$/.test(raw)) return null;
  return Number(raw);
}

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function shrinkToJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("No se ha podido preparar la foto."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se ha podido leer la foto."));
    };
    image.src = url;
  });
}
