import { NextResponse } from "next/server";

import { parseAgencySort } from "@/lib/domain/agency-browse";
import { publicAgencySummary } from "@/lib/domain/public-agency";
import { agencyService } from "@/lib/container";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const sort = parseAgencySort(searchParams.get("orden"));
  const agencies = await agencyService.search(q, { sort });
  return NextResponse.json({
    agencies: agencies.map((agency) => publicAgencySummary(agency)),
  });
}
