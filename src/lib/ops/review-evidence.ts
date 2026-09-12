import type { SupabaseClient } from "@supabase/supabase-js";

import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const REVIEW_EVIDENCE_BUCKET = "review-evidence";
export const MAX_REVIEW_EVIDENCE_BYTES = 3 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function assertReviewEvidenceFile(file: { size: number; type: string }) {
  if (!TYPES.has(file.type)) {
    throw new Error("La evidencia debe ser jpg, png, webp o PDF");
  }
  if (file.size > MAX_REVIEW_EVIDENCE_BYTES) {
    throw new Error("La evidencia no puede pesar más de 3 MB");
  }
}

export async function storeReviewEvidence(
  client: SupabaseClient,
  userId: string,
  file: Blob,
  contentType: string,
) {
  assertReviewEvidenceFile({ size: file.size, type: contentType });
  const extension = EXTENSIONS[contentType] ?? "bin";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage
    .from(REVIEW_EVIDENCE_BUCKET)
    .upload(path, file, { contentType, upsert: false });
  if (error) throw new Error("No se pudo guardar la evidencia");
  return path;
}

export async function resolveReviewEvidenceUrl(path?: string) {
  if (!path || !isSupabaseConfigured()) return undefined;
  const { data, error } = await createServiceClient()
    .storage.from(REVIEW_EVIDENCE_BUCKET)
    .createSignedUrl(path, 15 * 60);
  return error ? undefined : data.signedUrl;
}

export async function purgeExpiredReviewEvidence() {
  if (!isSupabaseConfigured()) return 0;
  const client = createServiceClient();
  const { data, error } = await client
    .from("reviews")
    .select("id, evidence_path")
    .not("evidence_path", "is", null)
    .lte("evidence_delete_after", new Date().toISOString());
  if (error) throw new Error("No se pudo consultar la retención de evidencias");
  const rows = (data ?? []) as Array<{ id: string; evidence_path: string }>;
  if (rows.length === 0) return 0;

  const { error: storageError } = await client.storage
    .from(REVIEW_EVIDENCE_BUCKET)
    .remove(rows.map((row) => row.evidence_path));
  if (storageError) throw new Error("No se pudieron borrar las evidencias");

  const { error: updateError } = await client
    .from("reviews")
    .update({ evidence_path: null, evidence_delete_after: null })
    .in(
      "id",
      rows.map((row) => row.id),
    );
  if (updateError) throw new Error("No se pudo registrar el borrado");
  return rows.length;
}
