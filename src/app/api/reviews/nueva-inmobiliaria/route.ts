import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { authService, provisionalAgencyService } from "@/lib/container";
import { formText, reviewMultipartFields } from "@/lib/domain/review-form-data";
import { storeReviewEvidence } from "@/lib/ops/review-evidence";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

function formatError(error: unknown): string {
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
        ...reviewMultipartFields(form),
        name: formText(form, "name"),
        city: formText(form, "city"),
        address: formText(form, "address"),
      };
    } else {
      body = await request.json();
    }

    const result = await provisionalAgencyService.publishWithReview(user, body, {
      evidencePath,
    });
    return NextResponse.json(
      {
        review: result.review,
        agency: {
          id: result.agency.id,
          slug: result.agency.slug,
          provisional: Boolean(result.agency.provisional),
          created: result.createdAgency,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    try {
      if (evidencePath && isSupabaseConfigured()) {
        await createServiceClient()
          .storage.from("review-evidence")
          .remove([evidencePath]);
      }
    } catch {
      // The review error is the one the author needs.
    }
    const message = formatError(error);
    const status =
      message.includes("verificación") ||
      message.includes("verification") ||
      message.includes("caducado")
        ? 401
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
