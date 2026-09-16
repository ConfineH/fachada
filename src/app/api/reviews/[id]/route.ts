import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { authService, reviewService } from "@/lib/container";

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
    return NextResponse.json({ review });
  } catch (error) {
    const message = formatError(error);
    return NextResponse.json({ error: message }, { status: statusFor(message) });
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
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = formatError(error);
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
}
