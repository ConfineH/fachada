import { NextResponse } from "next/server";

import { authErrorMessage } from "@/lib/auth/auth-errors";
import { authService } from "@/lib/container";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    const session = await authService.verifyEmailCode(email, code);
    return NextResponse.json({ ok: true, token: session.token });
  } catch (error) {
    return NextResponse.json(
      { error: authErrorMessage(error) },
      { status: 400 },
    );
  }
}
