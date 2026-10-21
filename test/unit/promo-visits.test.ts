import { beforeEach, describe, expect, it } from "vitest";

import { readUtmValue } from "@/lib/domain/promo-utm";
import { MemoryStore } from "@/lib/repositories/memory-store";
import { PromoVisitService } from "@/lib/services/promo-visit-service";

describe("promo visit counts", () => {
  let service: PromoVisitService;

  beforeEach(() => {
    service = new PromoVisitService(new MemoryStore());
  });

  it("keeps letters, digits and a few separators", () => {
    expect(readUtmValue(" QR ")).toBe("qr");
    expect(readUtmValue("Madrid 2026")).toBe("madrid-2026");
    expect(readUtmValue("a<script>")).toBe("ascript");
  });

  it("counts a source and campaign pair in memory", async () => {
    await service.record("qr", "madrid");
    await service.record("QR", "Madrid");
    await service.record("qr", "barcelona");
    await service.record("", "");

    const visits = await service.list();
    expect(visits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "qr", campaign: "madrid", visits: 2 }),
        expect.objectContaining({
          source: "qr",
          campaign: "barcelona",
          visits: 1,
        }),
      ]),
    );
    expect(visits).toHaveLength(2);
  });
});
