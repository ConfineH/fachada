import { NextResponse } from "next/server";

import { isEmailAuthEnabled } from "@/lib/services/email-provider";
import { isGoogleAuthConfigured } from "@/lib/services/google-auth";

export async function GET() {
  return NextResponse.json({
    google: isGoogleAuthConfigured(),
    email: isEmailAuthEnabled(),
  });
}
