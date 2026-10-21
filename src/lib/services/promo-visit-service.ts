import { readUtmValue } from "@/lib/domain/promo-utm";
import type { Repository } from "@/lib/repositories/types";

export class PromoVisitService {
  constructor(private readonly repo: Repository) {}

  async record(source: string, campaign: string) {
    const cleanSource = readUtmValue(source);
    const cleanCampaign = readUtmValue(campaign);
    if (!cleanSource && !cleanCampaign) return;
    await this.repo.recordPromoVisit(cleanSource, cleanCampaign);
  }

  list() {
    return this.repo.listPromoVisits();
  }
}
