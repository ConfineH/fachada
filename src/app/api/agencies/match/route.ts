import { NextResponse } from "next/server";

import { agencyService } from "@/lib/container";

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

  const match = await agencyService.matchByName(name, city, { publicOnly: true });
  if (!match) {
    return NextResponse.json({ match: null }, { headers: corsHeaders });
  }

  return NextResponse.json(
    {
      match: {
        name: match.agency.name,
        slug: match.slug,
        city: match.agency.city,
        confidence: match.confidence,
        urlPath: match.url,
        ratings: match.roleRatings,
      },
    },
    { headers: corsHeaders },
  );
}
