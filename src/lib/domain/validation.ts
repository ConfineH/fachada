import { z } from "zod";

import { INCIDENT_TAGS } from "@/lib/domain/incidents";
import {
  experienceDateError,
  REVIEW_TERMS_VERSION,
} from "@/lib/domain/review-authenticity";
import type {
  ClaimEvidenceType,
  ContentNoticeCategory,
  RepresentativeRole,
  ReviewExperienceType,
} from "@/lib/domain/types";

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

const reviewExperienceTypes = [
  "visita",
  "negociacion",
  "alquiler",
  "incidencia",
  "gestion",
] as const satisfies readonly ReviewExperienceType[];

const contentNoticeCategories = [
  "honor",
  "privacy",
  "personal_data",
  "threat",
  "intellectual_property",
  "fake_experience",
  "other_illegal",
] as const satisfies readonly ContentNoticeCategory[];

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
    pros: z
      .string()
      .trim()
      .min(10, "Las ventajas deben tener al menos 10 caracteres")
      .max(450),
    cons: z
      .string()
      .trim()
      .min(10, "Las desventajas deben tener al menos 10 caracteres")
      .max(450),
    anonymous: z.boolean().optional().default(true),
    publicName: z.string().trim().max(40).optional(),
    wouldRecommend: z.boolean().optional(),
    incidentTags: z.array(z.enum(INCIDENT_TAGS)).max(7).optional().default([]),
    experienceDate: z.coerce.date(),
    experienceType: z.enum(reviewExperienceTypes),
    firstHandAttested: z.literal(true, {
      error: "Confirma que la experiencia es propia",
    }),
    noIncentiveAttested: z.literal(true, {
      error: "Confirma que no has recibido incentivos",
    }),
    noConflictAttested: z.literal(true, {
      error: "Confirma que no existe un conflicto de interés",
    }),
    termsAccepted: z.literal(true, {
      error: "Acepta las normas de uso y contenidos",
    }),
    termsVersion: z.literal(REVIEW_TERMS_VERSION),
  })
  .superRefine((data, ctx) => {
    if (!data.agencyId && !data.agencySlug) {
      ctx.addIssue({
        code: "custom",
        path: ["agencySlug"],
        message: "Indica la inmobiliaria",
      });
    }
    if (!data.anonymous && !data.publicName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["publicName"],
        message: "Indica un nombre público o publica de forma anónima",
      });
    }
    const dateError = experienceDateError(data.experienceDate);
    if (dateError) {
      ctx.addIssue({
        code: "custom",
        path: ["experienceDate"],
        message: dateError,
      });
    }
  });

export const contentNoticeInputSchema = z.object({
  reviewId: z.string().uuid(),
  reporterName: z.string().trim().min(2).max(120),
  reporterEmail: accountEmailSchema,
  relationship: z.string().trim().max(120).optional(),
  category: z.enum(contentNoticeCategories),
  exactExcerpt: z.string().trim().min(3).max(500),
  legalReason: z.string().trim().min(20).max(2_000),
  evidenceUrl: z.string().url().max(500).optional(),
  goodFaithAttested: z.literal(true, {
    error: "Confirma de buena fe que la notificación es exacta",
  }),
});

export const contentNoticeDecisionSchema = z.object({
  status: z.enum(["retirado", "mantenido", "informacion_requerida"]),
  decisionRule: z.string().trim().min(3).max(200),
  decisionReason: z.string().trim().min(20).max(2_000),
});

export const contentNoticeAppealSchema = z.object({
  appealReason: z.string().trim().min(20).max(2_000),
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

export const adminCreateAgencySchema = agencySubmissionInputSchema.extend({
  aliases: z
    .array(z.string().trim().min(2).max(80))
    .max(12)
    .optional()
    .default([]),
});

export const adminAddAliasSchema = z
  .object({
    agencyId: z.string().uuid().optional(),
    slug: z.string().trim().min(1).max(160).optional(),
    alias: z.string().trim().min(2).max(80),
    kind: z.enum(["commercial", "legal", "former"]).optional().default("commercial"),
    note: z.string().trim().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.agencyId && !data.slug) {
      ctx.addIssue({
        code: "custom",
        path: ["slug"],
        message: "Indica el slug o el id de la ficha",
      });
    }
  });

export const agencyLocationInputSchema = z.object({
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(80).default("Madrid"),
  postalCode: z.string().trim().max(10).optional().default(""),
  label: z.string().trim().max(80).optional(),
  note: z.string().trim().max(300).optional(),
  kind: z.enum(["branch", "reported"]).optional(),
});

const optionalHttpUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().url().optional());

export const agencyTipInputSchema = z
  .object({
    kind: z.enum(["principal", "branch", "former_name", "legal_name"]),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(80).optional(),
    postalCode: z.string().trim().max(10).optional(),
    label: z.string().trim().max(80).optional(),
    alias: z.string().trim().max(120).optional(),
    year: z.preprocess(
      (value) => (value === "" || value === undefined || value === null ? undefined : value),
      z.coerce.number().int().min(1900).max(2035).optional(),
    ),
    note: z.string().trim().max(500).optional(),
    sourceUrl: optionalHttpUrl,
    evidencePath: z.string().trim().max(400).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "principal" || data.kind === "branch") {
      if (!data.address || data.address.length < 5) {
        ctx.addIssue({
          code: "custom",
          path: ["address"],
          message: "Indica la calle y el número",
        });
      }
      if (!data.city || data.city.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["city"],
          message: "Indica la ciudad",
        });
      }
    }
    if (data.kind === "former_name" || data.kind === "legal_name") {
      if (!data.alias || data.alias.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["alias"],
          message: "Indica el nombre",
        });
      }
    }
  });

export const adminCreateLocationSchema = agencyLocationInputSchema.extend({
  agencyId: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(160).optional(),
  kind: z.enum(["branch", "reported"]).optional().default("reported"),
}).superRefine((data, ctx) => {
  if (!data.agencyId && !data.slug) {
    ctx.addIssue({
      code: "custom",
      path: ["slug"],
      message: "Indica el slug o el id de la ficha",
    });
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
export type ContentNoticeInput = z.infer<typeof contentNoticeInputSchema>;
export type ContentNoticeDecisionInput = z.infer<
  typeof contentNoticeDecisionSchema
>;
export type ContentNoticeAppealInput = z.infer<
  typeof contentNoticeAppealSchema
>;
export type AgencyTipInput = z.infer<typeof agencyTipInputSchema>;
export type AdminCreateAgencyInput = z.infer<typeof adminCreateAgencySchema>;
export type AgencyProfileUpdate = z.infer<typeof agencyProfileUpdateSchema>;
export type ClaimInput = z.infer<typeof claimInputSchema>;
export type AgencyResponseInput = z.infer<typeof agencyResponseSchema>;
