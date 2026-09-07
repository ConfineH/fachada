import { NextResponse } from "next/server";

import { authErrorMessage } from "@/lib/auth/auth-errors";
import { authService } from "@/lib/container";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const result = await authService.requestEmailCode(email);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: authErrorMessage(error) },
      { status: 400 },
    );
  }
}
