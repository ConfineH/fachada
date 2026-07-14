import { NextResponse } from "next/server";

import { agencyService } from "@/lib/container";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const agencies = await agencyService.search(q);
  return NextResponse.json({ agencies });
}
