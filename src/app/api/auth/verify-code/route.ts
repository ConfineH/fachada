import { NextResponse } from "next/server";

import { authErrorMessage } from "@/lib/auth/auth-errors";
import { authService } from "@/lib/container";

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();
    const session = await authService.verifyCode(phone, code);
    return NextResponse.json({ ok: true, token: session.token });
  } catch (error) {
    return NextResponse.json(
      { error: authErrorMessage(error) },
      { status: 400 },
    );
  }
}
