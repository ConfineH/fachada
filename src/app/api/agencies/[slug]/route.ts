import { NextResponse } from "next/server";

import { agencyService, authService, claimService } from "@/lib/container";
import { agencyProfileUpdateSchema } from "@/lib/domain/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const agency = await agencyService.getBySlug(slug);
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }
  return NextResponse.json({ agency });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const agency = await agencyService.getBySlug(slug, { publicOnly: false });
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await authService.getUserFromSession(token);
    const canManage = await claimService.canManageAgency(user, agency.id);
    if (!canManage) {
      return NextResponse.json(
        { error: "Not authorized to update this agency" },
        { status: 403 },
      );
    }

    const parsed = agencyProfileUpdateSchema.parse(await request.json());
    const updated = await agencyService.updatePublicProfile(slug, parsed);
    return NextResponse.json({ agency: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
