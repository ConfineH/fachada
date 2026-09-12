import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { authService, contentNoticeService } from "@/lib/container";
import { ContentNoticeError } from "@/lib/services/content-notice-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const token = sessionTokenFromRequest(request);
    const user = await authService.getUserFromSession(token);
    const notice = await contentNoticeService.appeal(
      user,
      id,
      await request.json(),
    );
    return NextResponse.json({
      id: notice.id,
      appealedAt: notice.appealedAt?.toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof ZodError
        ? (error.issues[0]?.message ?? "Solicitud no válida")
        : error instanceof ContentNoticeError
          ? error.message
          : "No se pudo solicitar la revisión";
    const status = message === "Identificación necesaria" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
