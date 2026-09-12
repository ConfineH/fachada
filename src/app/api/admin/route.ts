import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE_NAME } from "@/lib/auth/admin-session";
import { adminService } from "@/lib/container";
import { requireAdmin } from "@/lib/auth/require-admin";
import { purgeExpiredReviewEvidence } from "@/lib/ops/review-evidence";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const [claims, reviews, submissions, locations, tips, contentNotices] =
    await Promise.all([
      adminService.listPendingClaims(),
      adminService.listReviewsForModeration(),
      adminService.listPendingAgencySubmissions(),
      adminService.listPendingLocations(),
      adminService.listPendingTips(),
      adminService.listPendingContentNotices(),
    ]);

  return NextResponse.json({
    claims,
    reviews,
    submissions,
    locations,
    tips,
    contentNotices,
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { action, id } = body as {
    action?: string;
    id?: string;
    agency?: unknown;
    agencyId?: string;
    slug?: string;
    alias?: string;
    kind?: string;
    note?: string;
    location?: unknown;
  };
  if (!action) {
    return NextResponse.json({ error: "action required" }, { status: 400 });
  }

  try {
    switch (action) {
      case "cleanup-review-evidence":
        return NextResponse.json({
          deleted: await purgeExpiredReviewEvidence(),
        });
      case "create-agency":
        return NextResponse.json({
          agency: await adminService.createAgency(body.agency),
        });
      case "add-alias":
        return NextResponse.json({
          alias: await adminService.addAlias({
            agencyId: body.agencyId,
            slug: body.slug,
            alias: body.alias,
            kind: body.kind,
            note: body.note,
          }),
        });
      case "create-location":
        return NextResponse.json({
          location: await adminService.createLocation(body.location),
        });
      case "approve-claim":
      case "reject-claim":
      case "moderate-review":
      case "flag-review":
      case "approve-agency-submission":
      case "reject-agency-submission":
      case "publish-location":
      case "reject-location":
      case "approve-tip":
      case "reject-tip":
      case "decide-content-notice":
        if (!id) {
          return NextResponse.json({ error: "id required" }, { status: 400 });
        }
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    switch (action) {
      case "approve-claim":
        return NextResponse.json({ claim: await adminService.approveClaim(id!) });
      case "reject-claim":
        return NextResponse.json({ claim: await adminService.rejectClaim(id!) });
      case "moderate-review":
        return NextResponse.json({
          review: await adminService.moderateReview(
            id!,
            String(body.reason ?? ""),
            true,
            body.accreditExperience === true,
          ),
        });
      case "flag-review":
        return NextResponse.json({
          review: await adminService.flagReview(id!, String(body.reason ?? "")),
        });
      case "approve-agency-submission": {
        const agency = await adminService.approveAgencySubmission(id!);
        return NextResponse.json({ agency });
      }
      case "reject-agency-submission":
        return NextResponse.json({
          submission: await adminService.rejectAgencySubmission(id!),
        });
      case "publish-location":
        return NextResponse.json({
          location: await adminService.publishLocation(id!),
        });
      case "reject-location":
        return NextResponse.json({
          location: await adminService.rejectLocation(id!),
        });
      case "approve-tip":
        return NextResponse.json({ tip: await adminService.approveTip(id!) });
      case "reject-tip":
        return NextResponse.json({ tip: await adminService.rejectTip(id!) });
      case "decide-content-notice":
        return NextResponse.json({
          notice: await adminService.decideContentNotice(id!, {
            status: body.status,
            decisionRule: body.decisionRule,
            decisionReason: body.decisionReason,
          }),
        });
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
