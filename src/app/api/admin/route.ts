import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE_NAME } from "@/lib/auth/admin-session";
import { adminService } from "@/lib/container";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const [claims, reviews] = await Promise.all([
    adminService.listPendingClaims(),
    adminService.listReviewsForModeration(),
  ]);

  return NextResponse.json({ claims, reviews });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { action, id } = body as { action?: string; id?: string };
  if (!action || !id) {
    return NextResponse.json({ error: "action and id required" }, { status: 400 });
  }

  try {
    switch (action) {
      case "approve-claim":
        return NextResponse.json({ claim: await adminService.approveClaim(id) });
      case "reject-claim":
        return NextResponse.json({ claim: await adminService.rejectClaim(id) });
      case "moderate-review":
        return NextResponse.json({ review: await adminService.moderateReview(id) });
      case "flag-review":
        return NextResponse.json({ review: await adminService.flagReview(id) });
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
