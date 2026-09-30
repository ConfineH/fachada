import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { authService, reviewService } from "@/lib/container";

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
    response.headers.set(
      "Access-Control-Allow-Methods",
      "PATCH, DELETE, OPTIONS",
    );
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export async function OPTIONS(request: Request) {
  return withReviewCors(request, new NextResponse(null, { status: 204 }));
}

function statusFor(message: string) {
  if (message.includes("verificación") || message.includes("verification")) {
    return 401;
  }
  if (message === "Reseña no encontrada") return 404;
  if (message.startsWith("Solo puedes")) return 403;
  return 400;
}

function formatError(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Datos de la reseña no válidos";
  }
  return reviewErrorMessage(error);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await authService.getUserFromSession(
      sessionTokenFromRequest(request),
    );
    const review = await reviewService.update(user, id, await request.json());
    return withReviewCors(request, NextResponse.json({ review }));
  } catch (error) {
    const message = formatError(error);
    return withReviewCors(
      request,
      NextResponse.json({ error: message }, { status: statusFor(message) }),
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await authService.getUserFromSession(
      sessionTokenFromRequest(request),
    );
    await reviewService.remove(user, id);
    return withReviewCors(request, NextResponse.json({ ok: true }));
  } catch (error) {
    const message = formatError(error);
    return withReviewCors(
      request,
      NextResponse.json({ error: message }, { status: statusFor(message) }),
    );
  }
}
