export const MAX_REVIEW_EVIDENCE_BYTES = 3 * 1024 * 1024;

export const EVIDENCE_TOO_LARGE_ERROR =
  "No se ha publicado la reseña porque el documento pesa más de 3 MB. Quítalo, o publica sin documento.";

export function evidenceWithinLimit(size: number) {
  return size <= MAX_REVIEW_EVIDENCE_BYTES;
}

/** Shrink a photo so it can travel with the review. PDFs over the limit are rejected. */
export async function prepareEvidenceFile(file: File): Promise<File> {
  if (evidenceWithinLimit(file.size)) return file;
  if (!file.type.startsWith("image/")) {
    throw new Error(EVIDENCE_TOO_LARGE_ERROR);
  }
  const shrunk = await shrinkImage(file);
  if (!evidenceWithinLimit(shrunk.size)) {
    throw new Error(EVIDENCE_TOO_LARGE_ERROR);
  }
  return shrunk;
}

function shrinkImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const maxEdge = 1600;
      const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error(EVIDENCE_TOO_LARGE_ERROR));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(EVIDENCE_TOO_LARGE_ERROR));
            return;
          }
          const name = file.name.replace(/\.\w+$/, "") || "captura";
          resolve(new File([blob], `${name}.jpg`, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.72,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(EVIDENCE_TOO_LARGE_ERROR));
    };
    image.src = url;
  });
}
