"use client";

import { useEffect } from "react";

const sent = new Set<string>();

export function PromoVisitBeacon({
  source,
  campaign,
}: {
  source: string;
  campaign: string;
}) {
  useEffect(() => {
    if (!source && !campaign) return;
    const key = `${source}|${campaign}`;
    if (sent.has(key)) return;
    sent.add(key);
    void fetch("/api/promo/visita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, campaign }),
    });
  }, [source, campaign]);

  return null;
}
