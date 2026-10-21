import {
  CONDITION_LABELS,
  HASH_NOT_TIMESTAMP,
  type HandoverActa,
} from "@/lib/domain/tools/handover";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const BODY = 11;
const LINE = 15;

export async function buildActaPdf(acta: HandoverActa, contentHash: string): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.12, 0.12, 0.12);
  const muted = rgb(0.35, 0.35, 0.35);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const nextPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  };

  const ensure = (height: number) => {
    if (y - height < MARGIN) nextPage();
  };

  const write = (text: string, options?: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> }) => {
    const size = options?.size ?? BODY;
    const face = options?.bold ? bold : font;
    const color = options?.color ?? ink;
    const max = PAGE_WIDTH - MARGIN * 2;
    const words = pdfSafe(text).split(/\s+/).filter(Boolean);
    let line = "";
    const flush = (value: string) => {
      ensure(LINE);
      page.drawText(value, { x: MARGIN, y, size, font: face, color });
      y -= LINE;
    };
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (face.widthOfTextAtSize(candidate, size) > max && line) {
        flush(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) flush(line);
  };

  const drawDataUrl = async (dataUrl: string, maxHeight: number) => {
    const parsed = dataUrlBytes(dataUrl);
    if (!parsed) return;
    const image =
      parsed.mime === "image/png"
        ? await pdf.embedPng(parsed.bytes).catch(() => null)
        : await pdf.embedJpg(parsed.bytes).catch(() => null);
    if (!image) return;
    const maxWidth = PAGE_WIDTH - MARGIN * 2;
    const width = Math.min(maxWidth, 240);
    const height = Math.min(maxHeight, (image.height / image.width) * width);
    const drawnWidth = (image.width / image.height) * height;
    ensure(height + 8);
    page.drawImage(image, { x: MARGIN, y: y - height, width: Math.min(width, drawnWidth), height });
    y -= height + 8;
  };

  write(acta.mode === "salida" ? "Acta de salida del piso" : "Acta de entrada al piso", {
    size: 16,
    bold: true,
  });
  y -= 6;
  write(`${acta.address || "Sin dirección"} · ${acta.date || "sin fecha"} ${acta.time || ""}`.trim());
  write(`Arrendador: ${acta.landlordName || "-"}`);
  write(`Arrendatario: ${acta.tenantName || "-"}`);
  write(
    `Contadores. Luz: ${acta.meters.luz || "-"} · Agua: ${acta.meters.agua || "-"} · Gas: ${acta.meters.gas || "-"}`,
  );
  write(`Llaves: ${acta.keys ?? "-"} · Mandos: ${acta.remotes ?? "-"}`);
  y -= 8;

  for (const room of acta.rooms) {
    write(room.name, { bold: true });
    for (const element of room.elements) {
      const note = element.note.trim() ? ` ${element.note.trim()}` : "";
      write(`${element.name}: ${CONDITION_LABELS[element.condition]}.${note}`);
      for (const photo of element.photos) await drawDataUrl(photo.dataUrl, 180);
    }
    y -= 6;
  }

  write("Firmas", { bold: true });
  write("Arrendador");
  if (acta.landlordSignature) await drawDataUrl(acta.landlordSignature, 90);
  else write("Sin firma.");
  write("Arrendatario");
  if (acta.tenantSignature) await drawDataUrl(acta.tenantSignature, 90);
  else write("Sin firma.");

  y -= 8;
  write("Código de integridad", { bold: true });
  write(contentHash, { size: 9, color: muted });
  write(HASH_NOT_TIMESTAMP, { size: 9, color: muted });

  return pdf.save({ useObjectStreams: false });
}

function pdfSafe(value: string): string {
  return value
    .replaceAll("—", "-")
    .replaceAll("–", "-")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("’", "'");
}

function dataUrlBytes(dataUrl: string): { mime: string; bytes: Uint8Array } | null {
  const match = /^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match?.[1] || !match[2]) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return { mime: match[1], bytes };
}
