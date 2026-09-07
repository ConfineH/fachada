import { spanishBusinessPhoneSchema } from "@/lib/domain/validation";
import type { Agency } from "@/lib/domain/types";

/** Teléfono de negocio publicado en ficha y usable para OTP (camino Google). */
export function agencyHasPublishedPhone(agency: Agency) {
  if (agency.phonePublished === false) return false;
  return spanishBusinessPhoneSchema.safeParse(agency.phone).success;
}

/** Emails internos de alta incompleta; no se muestran en ficha pública. */
export function publicAgencyEmail(email: string | undefined) {
  const value = email?.trim() ?? "";
  if (!value) return undefined;
  if (value.toLowerCase().endsWith("@fachada.local")) return undefined;
  return value;
}
