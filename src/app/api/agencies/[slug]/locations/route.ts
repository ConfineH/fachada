import { NextResponse } from "next/server";

import { agencyService, authService, claimService } from "@/lib/container";
import { isAccountVerified } from "@/lib/domain/identity";
import { agencyLocationInputSchema } from "@/lib/domain/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await authService.getUserFromSession(token);
    if (!isAccountVerified(user)) {
      return NextResponse.json(
        { error: "Identifícate para sugerir una ubicación" },
        { status: 401 },
      );
    }

    const agency = await agencyService.getBySlug(slug, { publicOnly: false });
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const parsed = agencyLocationInputSchema.parse(await request.json());
    const canManage = await claimService.canManageAgency(user, agency.id);

    if (canManage) {
      const location = await agencyService.addLocation(agency.id, {
        kind: parsed.kind ?? "branch",
        status: "publicado",
        address: parsed.address,
        city: parsed.city,
        postalCode: parsed.postalCode ?? "",
        label: parsed.label,
        note: parsed.note,
      });
      return NextResponse.json({ location });
    }

    const location = await agencyService.suggestLocation(user, slug, parsed);
    return NextResponse.json({ location, pending: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
