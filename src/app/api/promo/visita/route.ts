import { NextResponse } from "next/server";

import { readUtmValue } from "@/lib/domain/promo-utm";
import { promoVisitService } from "@/lib/container";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    source?: string;
    campaign?: string;
  };
  const source = readUtmValue(body.source);
  const campaign = readUtmValue(body.campaign);
  if (!source && !campaign) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  await promoVisitService.record(source, campaign);
  return NextResponse.json({ ok: true });
}
