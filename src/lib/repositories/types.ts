import type {
  Agency,
  AgencyResponse,
  Claim,
  PendingVerification,
  Review,
  Session,
  User,
} from "@/lib/domain/types";

export interface Repository {
  // Users
  findUserByPhone(phone: string): User | undefined;
  findUserById(id: string): User | undefined;
  createUser(phone: string): User;
  updateUser(user: User): void;

  // Auth
  savePendingVerification(verification: PendingVerification): void;
  getPendingVerification(phone: string): PendingVerification | undefined;
  deletePendingVerification(phone: string): void;
  createSession(session: Session): void;
  findSessionByToken(token: string): Session | undefined;

  // Agencies
  listAgencies(): Agency[];
  findAgencyById(id: string): Agency | undefined;
  findAgencyBySlug(slug: string): Agency | undefined;
  updateAgency(agency: Agency): void;

  // Reviews
  listReviewsByAgency(agencyId: string): Review[];
  listReviewsByUser(userId: string): Review[];
  createReview(review: Review): void;

  // Claims
  createClaim(claim: Claim): void;
  listClaims(): Claim[];
  findClaimById(id: string): Claim | undefined;
  updateClaim(claim: Claim): void;

  // Agency responses
  findResponseByReviewId(reviewId: string): AgencyResponse | undefined;
  createAgencyResponse(response: AgencyResponse): void;
}
