import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  adminCookieOptions,
  createAdminToken,
  verifyAdminPassword,
} from "@/lib/auth/admin-session";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = createAdminToken();
  const cookieStore = await cookies();
  const options = adminCookieOptions();
  cookieStore.set(options.name, token, options);

  return NextResponse.json({ ok: true });
}
