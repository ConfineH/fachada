import { NextResponse } from "next/server";

import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { isAccountVerified } from "@/lib/domain/identity";
import { authService } from "@/lib/container";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await authService.getUserFromSession(token);
    if (!isAccountVerified(user)) {
      return NextResponse.json(
        { error: reviewErrorMessage(new Error("Account verification required")) },
        { status: 401 },
      );
    }

    const body = await request.json();
    const agencyId = body.agencyId as string;
    const code = body.code as string;
    if (!agencyId || !code) {
      return NextResponse.json(
        { error: "agencyId and code are required" },
        { status: 400 },
      );
    }

    const result = await authService.verifyAgencyBusinessCode(
      user.id,
      agencyId,
      code,
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
