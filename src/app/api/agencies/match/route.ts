import { NextResponse } from "next/server";

import { agencyService } from "@/lib/container";
import { publicRoleRatings } from "@/lib/domain/ratings";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const city = searchParams.get("city") ?? undefined;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  const [report, cityOnly] = await Promise.all([
    agencyService.matchByName(name, city, { publicOnly: true }),
    agencyService.namesACity(name),
  ]);
  const toPublic = (hit: (typeof report.identified)[number]) => ({
    name: hit.agency.name,
    slug: hit.slug,
    city: hit.agency.city,
    confidence: hit.confidence,
    band: hit.band,
    matchedOn: hit.matchedOn,
    urlPath: hit.url,
    ratings: publicRoleRatings(hit.roleRatings),
  });
  const identified = report.identified.map(toPublic);
  const hints = report.hints.map(toPublic);
  const onlyExact =
    identified.length === 1 && identified[0]?.band === "exact" ? identified[0] : null;

  return NextResponse.json(
    {
      identified,
      hints,
      cityOnly,
      match: onlyExact,
    },
    { headers: corsHeaders },
  );
}
