import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { authService, contentNoticeService } from "@/lib/container";
import { ContentNoticeError } from "@/lib/services/content-notice-service";
import { AuthError } from "@/lib/services/auth-service";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || undefined;
  return request.headers.get("x-real-ip")?.trim() || undefined;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      reporterEmail?: string;
      emailCode?: string;
    };
    const email = String(body.reporterEmail ?? "").trim().toLowerCase();
    const sessionUser = await authService.getUserFromSession(
      sessionTokenFromRequest(request),
    );
    let reporterVerified = Boolean(
      sessionUser?.emailVerified &&
        sessionUser.email?.trim().toLowerCase() === email,
    );
    if (!reporterVerified && body.emailCode) {
      const session = await authService.verifyEmailCode(email, body.emailCode);
      const verified = await authService.getUserFromSession(session.token);
      reporterVerified = Boolean(
        verified?.emailVerified &&
          verified.email?.trim().toLowerCase() === email,
      );
    }
    const notice = await contentNoticeService.create(body, {
      reporterVerified,
      ip: clientIp(request),
    });
    return NextResponse.json(
      {
        id: notice.id,
        status: notice.status,
        acknowledgedAt: notice.acknowledgedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof ZodError
        ? (error.issues[0]?.message ?? "Aviso no válido")
        : error instanceof ContentNoticeError || error instanceof AuthError
          ? error.message
          : "No se pudo registrar el aviso";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
