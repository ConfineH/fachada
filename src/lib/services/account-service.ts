import { isAccountVerified } from "@/lib/domain/identity";
import type { User } from "@/lib/domain/types";
import type { Repository } from "@/lib/repositories/types";

export class AccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountError";
  }
}

export class AccountService {
  constructor(private readonly repo: Repository) {}

  async dashboard(user: User) {
    const [reviews, saved, claims] = await Promise.all([
      this.repo.listReviewsByUser(user.id),
      this.repo.listSavedAgencies(user.id),
      this.repo.listClaims(),
    ]);

    const reviewsWithAgency = await Promise.all(
      reviews
        .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(async (review) => {
          const agency = await this.repo.findAgencyById(review.agencyId);
          return {
            id: review.id,
            title: review.title,
            rating: review.rating,
            moderated: review.moderated,
            flagged: review.flagged,
            createdAt: review.createdAt,
            agency: agency
              ? { name: agency.name, slug: agency.slug }
              : null,
          };
        }),
    );

    const claimedAgencies = (
      await Promise.all(
        claims
          .filter((claim) => claim.userId === user.id && claim.status === "aprobado")
          .map(async (claim) => {
            const agency = await this.repo.findAgencyById(claim.agencyId);
            return agency
              ? { name: agency.name, slug: agency.slug }
              : null;
          }),
      )
    ).filter((agency): agency is { name: string; slug: string } => agency !== null);

    return {
      user: {
        email: user.email,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      reviews: reviewsWithAgency,
      saved: saved.map((agency) => ({
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        city: agency.city,
      })),
      claimedAgencies,
    };
  }

  async saveAgency(user: User | undefined, agencyId: string) {
    if (!isAccountVerified(user)) {
      throw new AccountError("Account verification required");
    }
    const agency = await this.repo.findAgencyById(agencyId);
    if (!agency) throw new AccountError("Inmobiliaria no encontrada");
    await this.repo.saveAgency(user.id, agencyId);
  }

  async unsaveAgency(user: User | undefined, agencyId: string) {
    if (!isAccountVerified(user)) {
      throw new AccountError("Account verification required");
    }
    await this.repo.unsaveAgency(user.id, agencyId);
  }

  async isAgencySaved(user: User | undefined, agencyId: string) {
    if (!user) return false;
    return this.repo.isAgencySaved(user.id, agencyId);
  }
}
