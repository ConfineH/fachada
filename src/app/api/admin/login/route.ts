import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  adminCookieOptions,
  createAdminToken,
  isProductionAdminMisconfigured,
  verifyAdminPassword,
} from "@/lib/auth/admin-session";

export async function POST(request: Request) {
  if (isProductionAdminMisconfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD no está configurado en producción" },
      { status: 503 },
    );
  }
  const { password, name } = await request.json();
  const actor = String(name ?? "").trim();
  if (actor.length < 2) {
    return NextResponse.json(
      { error: "Indica tu nombre para que conste en la sesión." },
      { status: 400 },
    );
  }
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = createAdminToken(actor);
  const cookieStore = await cookies();
  const options = adminCookieOptions();
  cookieStore.set(options.name, token, options);

  return NextResponse.json({ ok: true });
}
