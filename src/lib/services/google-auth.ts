import { z } from "zod";

const googleTokenSchema = z.object({
  aud: z.string(),
  email: z.string().email(),
  email_verified: z.union([z.literal("true"), z.boolean()]),
});

export async function verifyGoogleIdToken(idToken: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("Google sign-in is not configured");
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );
  if (!response.ok) {
    throw new Error("Invalid Google token");
  }

  const parsed = googleTokenSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Invalid Google token");
  }

  const verified =
    parsed.data.email_verified === true || parsed.data.email_verified === "true";
  if (!verified || parsed.data.aud !== clientId) {
    throw new Error("Invalid Google token");
  }

  return parsed.data.email.toLowerCase();
}

export function isGoogleAuthConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());
}
