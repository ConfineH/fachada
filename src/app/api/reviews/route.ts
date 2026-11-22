import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { authService, reviewService } from "@/lib/container";
import { reviewMultipartFields } from "@/lib/domain/review-form-data";
import { storeReviewEvidence } from "@/lib/ops/review-evidence";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

const REVIEW_ORIGINS = new Set([
  "https://fachada.app",
  "https://www.fachada.app",
  "http://localhost:3000",
]);

function withReviewCors(request: Request, response: NextResponse) {
  const origin = request.headers.get("origin");
  if (origin && REVIEW_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type",
    );
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export async function OPTIONS(request: Request) {
  return withReviewCors(request, new NextResponse(null, { status: 204 }));
}

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
      body = reviewMultipartFields(form);
    } else {
      body = await request.json();
    }
    const review = await reviewService.create(user, body, { evidencePath });
    return withReviewCors(
      request,
      NextResponse.json({ review }, { status: 201 }),
    );
  } catch (error) {
    try {
      if (evidencePath && isSupabaseConfigured()) {
        await createServiceClient()
          .storage.from("review-evidence")
          .remove([evidencePath]);
      }
      const message = formatReviewApiError(error);
      const status =
        message.includes("verificación") ||
        message.includes("verification") ||
        message.includes("caducado")
          ? 401
          : 400;
      return withReviewCors(
        request,
        NextResponse.json({ error: message }, { status }),
      );
    } catch {
      return withReviewCors(
        request,
        NextResponse.json(
          { error: "No se pudo publicar la reseña." },
          { status: 500 },
        ),
      );
    }
  }
}
