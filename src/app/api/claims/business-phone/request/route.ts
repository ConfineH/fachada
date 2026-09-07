import { NextResponse } from "next/server";

import { authService } from "@/lib/container";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await authService.getUserFromSession(token);
    if (!user?.phoneVerified) {
      return NextResponse.json({ error: "Phone verification required" }, { status: 401 });
    }

    const body = await request.json();
    const agencyId = body.agencyId as string;
    if (!agencyId) {
      return NextResponse.json({ error: "agencyId is required" }, { status: 400 });
    }

    const result = await authService.requestAgencyBusinessCode(user.id, agencyId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
