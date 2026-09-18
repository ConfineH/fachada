import type { SupabaseClient } from "@supabase/supabase-js";

export const AGENCY_LOGOS_BUCKET = "agency-logos";
export const MAX_AGENCY_LOGO_BYTES = 1024 * 1024;
export const AGENCY_LOGO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function assertAgencyLogoFile(file: { size: number; type: string }) {
  if (!AGENCY_LOGO_TYPES.has(file.type)) {
    throw new Error("El logotipo tiene que ser jpg, png o webp");
  }
  if (file.size > MAX_AGENCY_LOGO_BYTES) {
    throw new Error("El logotipo no puede pesar más de 1 MB");
  }
}

export async function storeAgencyLogo(
  client: SupabaseClient,
  agencyId: string,
  file: Blob,
  contentType: string,
) {
  assertAgencyLogoFile({ size: file.size, type: contentType });
  await client.storage
    .createBucket(AGENCY_LOGOS_BUCKET, {
      public: true,
      fileSizeLimit: MAX_AGENCY_LOGO_BYTES,
    })
    .then(
      () => undefined,
      () => undefined,
    );

  const ext = EXTENSIONS[contentType] ?? "png";
  const path = `${agencyId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await client.storage
    .from(AGENCY_LOGOS_BUCKET)
    .upload(path, file, { contentType, upsert: false });
  if (error) throw new Error("No se pudo guardar el logotipo");
  return path;
}

export function agencyLogoUrl(path?: string) {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return undefined;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${AGENCY_LOGOS_BUCKET}/${path}`;
}
