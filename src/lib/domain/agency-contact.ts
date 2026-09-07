import { spanishBusinessPhoneSchema } from "@/lib/domain/validation";
import type { Agency } from "@/lib/domain/types";

/** Teléfono de negocio publicado en ficha y usable para OTP (camino Google). */
export function agencyHasPublishedPhone(agency: Agency) {
  if (agency.phonePublished === false) return false;
  return spanishBusinessPhoneSchema.safeParse(agency.phone).success;
}
