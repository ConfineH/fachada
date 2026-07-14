import { NextResponse } from "next/server";

import { authService } from "@/lib/container";

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();
    const session = await authService.verifyCode(phone, code);
    return NextResponse.json({ ok: true, token: session.token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}
