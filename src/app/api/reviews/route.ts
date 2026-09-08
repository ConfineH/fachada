import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { authService, reviewService } from "@/lib/container";

function formatReviewApiError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Datos de la reseña no válidos";
  }
  return reviewErrorMessage(error);
}

export async function POST(request: Request) {
  try {
    const token = sessionTokenFromRequest(request);
    const user = await authService.getUserFromSession(token);
    const body = await request.json();
    const review = await reviewService.create(user, body);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    const message = formatReviewApiError(error);
    const status = message.includes("verificación") || message.includes("verification")
      ? 401
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
