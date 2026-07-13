import { NextResponse } from "next/server";

import { agencyService } from "@/lib/container";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const agency = agencyService.getBySlug(slug);
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }
  return NextResponse.json({ agency });
}
