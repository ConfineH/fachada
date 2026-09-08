import { NextResponse } from "next/server";
import { z } from "zod";

import { sessionTokenFromRequest } from "@/lib/auth/bearer";
import { reviewErrorMessage } from "@/lib/auth/review-errors";
import { accountService, authService } from "@/lib/container";

const bodySchema = z.object({
  agencyId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const user = await authService.getUserFromSession(
      sessionTokenFromRequest(request),
    );
    const { agencyId } = bodySchema.parse(await request.json());
    await accountService.saveAgency(user, agencyId);
    return NextResponse.json({ saved: true });
  } catch (error) {
    const message = reviewErrorMessage(error);
    const status =
      message.includes("verificación") || message.includes("verification")
        ? 401
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await authService.getUserFromSession(
      sessionTokenFromRequest(request),
    );
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get("agencyId") ?? "";
    const parsed = bodySchema.parse({ agencyId });
    await accountService.unsaveAgency(user, parsed.agencyId);
    return NextResponse.json({ saved: false });
  } catch (error) {
    const message = reviewErrorMessage(error);
    const status =
      message.includes("verificación") || message.includes("verification")
        ? 401
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
