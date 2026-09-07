import { NextResponse } from "next/server";

import { authErrorMessage } from "@/lib/auth/auth-errors";
import { authService } from "@/lib/container";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    const result = await authService.requestCode(phone);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: authErrorMessage(error) },
      { status: 400 },
    );
  }
}
