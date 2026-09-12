import type { SupabaseClient } from "@supabase/supabase-js";

import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const TIP_EVIDENCE_BUCKET = "agency-tip-evidence";
export const MAX_TIP_EVIDENCE_BYTES = 3 * 1024 * 1024;
export const TIP_EVIDENCE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function assertTipEvidenceFile(file: { size: number; type: string }) {
  if (!TIP_EVIDENCE_TYPES.has(file.type)) {
    throw new Error("La captura tiene que ser jpg, png, webp o gif");
  }
  if (file.size > MAX_TIP_EVIDENCE_BYTES) {
    throw new Error("La captura no puede pesar más de 3 MB");
  }
}

export async function storeTipEvidence(
  client: SupabaseClient,
  agencyId: string,
  file: Blob,
  contentType: string,
) {
  assertTipEvidenceFile({ size: file.size, type: contentType });
  await client.storage.createBucket(TIP_EVIDENCE_BUCKET, {
    public: false,
    fileSizeLimit: MAX_TIP_EVIDENCE_BYTES,
  }).then(
    () => undefined,
    () => undefined,
  );

  const ext = EXTENSIONS[contentType] ?? "jpg";
  const path = `${agencyId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await client.storage
    .from(TIP_EVIDENCE_BUCKET)
    .upload(path, file, { contentType, upsert: false });
  if (error) throw new Error("No se pudo guardar la captura");
  return path;
}

export async function signTipEvidence(
  client: SupabaseClient,
  path: string,
) {
  const { data, error } = await client.storage
    .from(TIP_EVIDENCE_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) return undefined;
  return data.signedUrl;
}

export async function resolveTipEvidenceUrl(path?: string) {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!isSupabaseConfigured()) return undefined;
  return signTipEvidence(createServiceClient(), path);
}
