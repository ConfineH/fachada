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
  const dashboard = await accountService.dashboard(user);
  return NextResponse.json(dashboard);
}
