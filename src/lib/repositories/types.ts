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
  findUserByPhone(phone: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(phone: string): Promise<User>;
  updateUser(user: User): Promise<void>;

  savePendingVerification(verification: PendingVerification): Promise<void>;
  getPendingVerification(phone: string): Promise<PendingVerification | null>;
  deletePendingVerification(phone: string): Promise<void>;
  createSession(session: Session): Promise<void>;
  findSessionByToken(token: string): Promise<Session | null>;

  listAgencies(): Promise<Agency[]>;
  findAgencyById(id: string): Promise<Agency | null>;
  findAgencyBySlug(slug: string): Promise<Agency | null>;
  updateAgency(agency: Agency): Promise<void>;

  listReviewsByAgency(agencyId: string): Promise<Review[]>;
  listReviewsByUser(userId: string): Promise<Review[]>;
  listAllReviews(): Promise<Review[]>;
  findReviewById(id: string): Promise<Review | null>;
  updateReview(review: Review): Promise<void>;
  createReview(review: Review): Promise<void>;

  createClaim(claim: Claim): Promise<void>;
  listClaims(): Promise<Claim[]>;
  findClaimById(id: string): Promise<Claim | null>;
  updateClaim(claim: Claim): Promise<void>;

  findResponseByReviewId(reviewId: string): Promise<AgencyResponse | null>;
  createAgencyResponse(response: AgencyResponse): Promise<void>;
}
