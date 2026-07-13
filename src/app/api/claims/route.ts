import { NextResponse } from "next/server";

import { authService, claimService } from "@/lib/container";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = authService.getUserFromSession(token);
    const body = await request.json();
    const claim = claimService.submit(user, body);
    return NextResponse.json({ claim }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    const status = message.includes("verification") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
