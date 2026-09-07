import { NextResponse } from "next/server";

import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { authService, claimService } from "@/lib/container";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await authService.getUserFromSession(token);
    const body = await request.json();
    const claim = await claimService.submit(user, body);
    return NextResponse.json({ claim }, { status: 201 });
  } catch (error) {
    const message = reviewErrorMessage(error);
    const status = message.includes("verification") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
