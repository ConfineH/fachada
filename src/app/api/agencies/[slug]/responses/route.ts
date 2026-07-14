import { NextResponse } from "next/server";

import { authService, agencyService, claimService } from "@/lib/container";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const agency = await agencyService.getBySlug(slug);
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await authService.getUserFromSession(token);
  const canManage = await claimService.canManageAgency(user, agency.id);

  return NextResponse.json({ canManage });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const agency = await agencyService.getBySlug(slug);
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await authService.getUserFromSession(token);
    const body = await request.json();
    const response = await claimService.respond(user, agency.id, body);
    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    const status = message.includes("verification") ||
      message.includes("authorized")
      ? 403
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
