import { z } from "zod";

import { INCIDENT_TAGS } from "@/lib/domain/incidents";
import type { ClaimEvidenceType, RepresentativeRole } from "@/lib/domain/types";

const claimEvidenceTypes = [
  "cif_document",
  "corporate_registry",
  "power_of_attorney",
  "domain_proof",
  "storefront_video",
] as const satisfies readonly ClaimEvidenceType[];

const representativeRoles = [
  "director",
  "administrador",
  "comercial",
  "marketing",
  "rrhh",
  "otro",
] as const satisfies readonly RepresentativeRole[];

export const claimEvidenceSchema = z.object({
  type: z.enum(claimEvidenceTypes),
  url: z.string().url(),
});

export const spanishPhoneSchema = z
  .string()
  .regex(/^\+34[6-9]\d{8}$/, "Phone must be a valid Spanish mobile (+34...)");

/** Teléfono fijo o móvil español (verificación línea de negocio, estilo Google). */
export const spanishBusinessPhoneSchema = z
  .string()
  .regex(/^\+34\d{9}$/, "Phone must be a valid Spanish number (+34...)");

export const verificationCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Code must be 6 digits");

export const accountEmailSchema = z
  .string()
  .trim()
  .email("Indica un email válido")
  .transform((value) => value.toLowerCase());

export const reviewInputSchema = z
  .object({
    agencyId: z.string().uuid().optional(),
    agencySlug: z.string().trim().min(1).max(120).optional(),
    role: z.enum(["inquilino", "propietario"]),
    rating: z.coerce.number().int().min(1).max(5),
    title: z
      .string()
      .trim()
      .min(1, "El título es obligatorio")
      .max(100),
    body: z
      .string()
      .trim()
      .min(10, "El comentario debe tener al menos 10 caracteres")
      .max(1000),
    incidentTags: z.array(z.enum(INCIDENT_TAGS)).max(7).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (!data.agencyId && !data.agencySlug) {
      ctx.addIssue({
        code: "custom",
        path: ["agencySlug"],
        message: "Indica la inmobiliaria",
      });
    }
  });

export const agencySubmissionInputSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().min(4).max(10),
    address: z.string().trim().min(5).max(200),
    noPhoneOnline: z.boolean(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    idealistaUrl: z.string().url().optional(),
    note: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.noPhoneOnline) {
      const parsed = spanishBusinessPhoneSchema.safeParse(data.phone);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Indica un teléfono español válido (+34...)",
        });
      }
    }
  });

export const claimInputSchema = z.object({
  agencyId: z.string().uuid(),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().email(),
  contactPhone: spanishPhoneSchema,
  representativeRole: z.enum(representativeRoles),
  companyCif: z
    .string()
    .trim()
    .regex(/^[A-Z0-9][A-Z0-9-]{7,11}$/i, "CIF/NIF no válido")
    .optional(),
  evidence: z.array(claimEvidenceSchema).min(1).max(6),
  attestationAccepted: z.literal(true, {
    error: "Debes confirmar que representas legalmente a la inmobiliaria",
  }),
});

export const agencyResponseSchema = z.object({
  reviewId: z.string().uuid(),
  body: z.string().trim().min(1).max(500),
});

export const agencyProfileUpdateSchema = z.object({
  website: z.union([z.string().url(), z.literal("")]).optional(),
  googleMapsUrl: z.union([z.string().url(), z.literal("")]).optional(),
  idealistaUrl: z.union([z.string().url(), z.literal("")]).optional(),
  fotocasaUrl: z.union([z.string().url(), z.literal("")]).optional(),
  alias: z.string().trim().max(80).optional(),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type AgencyProfileUpdate = z.infer<typeof agencyProfileUpdateSchema>;
export type ClaimInput = z.infer<typeof claimInputSchema>;
export type AgencyResponseInput = z.infer<typeof agencyResponseSchema>;
