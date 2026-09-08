import { NextResponse } from "next/server";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { authService, reviewService } from "@/lib/container";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await authService.getUserFromSession(
      sessionTokenFromRequest(request),
    );
    const result = await reviewService.markHelpful(user, id);
    return NextResponse.json(result);
  } catch (error) {
    const message = reviewErrorMessage(error);
    const status =
      message.includes("verificación") || message.includes("verification")
        ? 401
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
