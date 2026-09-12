import { NextResponse } from "next/server";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { accountService, authService } from "@/lib/container";

export async function GET(request: Request) {
  const user = await authService.getUserFromSession(
    sessionTokenFromRequest(request),
  );
  if (!user) {
    return NextResponse.json({ error: "No hay sesión" }, { status: 401 });
  }

  const body = JSON.stringify(await accountService.exportData(user), null, 2);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fachada-datos.json"',
      "Cache-Control": "private, no-store",
    },
  });
}
