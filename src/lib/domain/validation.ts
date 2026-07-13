import { z } from "zod";

export const spanishPhoneSchema = z
  .string()
  .regex(/^\+34[6-9]\d{8}$/, "Phone must be a valid Spanish mobile (+34...)");

export const verificationCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Code must be 6 digits");

export const reviewInputSchema = z.object({
  agencyId: z.string().uuid(),
  role: z.enum(["inquilino", "propietario"]),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(10).max(1000),
});

export const claimInputSchema = z.object({
  agencyId: z.string().uuid(),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().email(),
  contactPhone: spanishPhoneSchema,
  documentationUrls: z.array(z.string().url()).min(1).max(5),
});

export const agencyResponseSchema = z.object({
  reviewId: z.string().uuid(),
  body: z.string().trim().min(1).max(500),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type ClaimInput = z.infer<typeof claimInputSchema>;
export type AgencyResponseInput = z.infer<typeof agencyResponseSchema>;
