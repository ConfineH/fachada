import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { contentNoticeService } from "@/lib/container";
import { ContentNoticeError } from "@/lib/services/content-notice-service";

export async function POST(request: Request) {
  try {
    const notice = await contentNoticeService.create(await request.json());
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
        ? (error.issues[0]?.message ?? "Denuncia no válida")
        : error instanceof ContentNoticeError
          ? error.message
          : "No se pudo registrar la denuncia";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
