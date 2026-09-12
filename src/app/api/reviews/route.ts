import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { authService, reviewService } from "@/lib/container";
import { storeReviewEvidence } from "@/lib/ops/review-evidence";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

function formatReviewApiError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Datos de la reseña no válidos";
  }
  return reviewErrorMessage(error);
}

export async function POST(request: Request) {
  let evidencePath: string | undefined;
  try {
    const token = sessionTokenFromRequest(request);
    const user = await authService.getUserFromSession(token);
    const contentType = request.headers.get("content-type") ?? "";
    let body: unknown;
    if (contentType.includes("multipart/form-data")) {
      if (!user) throw new Error("Account verification required");
      const form = await request.formData();
      const text = (key: string) => {
        const value = form.get(key);
        return typeof value === "string" ? value : undefined;
      };
      const evidence = form.get("evidence");
      if (evidence instanceof File && evidence.size > 0) {
        if (!isSupabaseConfigured()) {
          throw new Error("La evidencia privada requiere Supabase");
        }
        evidencePath = await storeReviewEvidence(
          createServiceClient(),
          user.id,
          evidence,
          evidence.type,
        );
      }
      body = {
        agencySlug: text("agencySlug"),
        role: text("role"),
        rating: text("rating"),
        title: text("title"),
        pros: text("pros"),
        cons: text("cons"),
        anonymous: text("anonymous") === "true",
        publicName: text("publicName"),
        wouldRecommend:
          text("wouldRecommend") === "undefined"
            ? undefined
            : text("wouldRecommend") === "true",
        incidentTags: JSON.parse(text("incidentTags") ?? "[]"),
        experienceDate: text("experienceDate"),
        experienceType: text("experienceType"),
        firstHandAttested: text("firstHandAttested") === "true",
        noIncentiveAttested: text("noIncentiveAttested") === "true",
        noConflictAttested: text("noConflictAttested") === "true",
        termsAccepted: text("termsAccepted") === "true",
        termsVersion: text("termsVersion"),
      };
    } else {
      body = await request.json();
    }
    const review = await reviewService.create(user, body, { evidencePath });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (evidencePath && isSupabaseConfigured()) {
      await createServiceClient()
        .storage.from("review-evidence")
        .remove([evidencePath]);
    }
    const message = formatReviewApiError(error);
    const status = message.includes("verificación") || message.includes("verification")
      ? 401
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
