import type {
  Agency,
  AgencyNameAlias,
  AgencyResponse,
  AgencySubmission,
  Claim,
  PendingEmailVerification,
  PendingVerification,
  Review,
  Session,
  User,
} from "@/lib/domain/types";

export interface Repository {
  findUserByPhone(phone: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(input: { phone?: string; email?: string }): Promise<User>;
  updateUser(user: User): Promise<void>;

  savePendingVerification(verification: PendingVerification): Promise<void>;
  getPendingVerification(phone: string): Promise<PendingVerification | null>;
  deletePendingVerification(phone: string): Promise<void>;

  savePendingEmailVerification(
    verification: PendingEmailVerification,
  ): Promise<void>;
  getPendingEmailVerification(
    email: string,
  ): Promise<PendingEmailVerification | null>;
  deletePendingEmailVerification(email: string): Promise<void>;

  savePendingBusinessLineVerification(
    userId: string,
    agencyId: string,
    verification: PendingVerification,
  ): Promise<void>;
  getPendingBusinessLineVerification(
    userId: string,
    agencyId: string,
  ): Promise<PendingVerification | null>;
  deletePendingBusinessLineVerification(
    userId: string,
    agencyId: string,
  ): Promise<void>;
  markBusinessLineVerified(
    userId: string,
    agencyId: string,
    expiresAt: Date,
  ): Promise<void>;
  hasBusinessLineVerified(userId: string, agencyId: string): Promise<boolean>;
  clearBusinessLineVerified(userId: string, agencyId: string): Promise<void>;

  createSession(session: Session): Promise<void>;
  findSessionByToken(token: string): Promise<Session | null>;

  listAgencies(): Promise<Agency[]>;
  findAgencyById(id: string): Promise<Agency | null>;
  findAgencyBySlug(slug: string): Promise<Agency | null>;
  createAgency(agency: Agency): Promise<void>;
  updateAgency(agency: Agency): Promise<void>;

  createAgencySubmission(submission: AgencySubmission): Promise<void>;
  listAgencySubmissions(): Promise<AgencySubmission[]>;
  findAgencySubmissionById(id: string): Promise<AgencySubmission | null>;
  updateAgencySubmission(submission: AgencySubmission): Promise<void>;

  listReviewsByAgency(agencyId: string): Promise<Review[]>;
  listReviewsByUser(userId: string): Promise<Review[]>;
  listAllReviews(): Promise<Review[]>;
  findReviewById(id: string): Promise<Review | null>;
  updateReview(review: Review): Promise<void>;
  createReview(review: Review): Promise<void>;
  addReviewHelpful(
    userId: string,
    reviewId: string,
  ): Promise<{ added: boolean; helpfulCount: number }>;

  listSavedAgencies(userId: string): Promise<Agency[]>;
  saveAgency(userId: string, agencyId: string): Promise<void>;
  unsaveAgency(userId: string, agencyId: string): Promise<void>;
  isAgencySaved(userId: string, agencyId: string): Promise<boolean>;

  createClaim(claim: Claim): Promise<void>;
  listClaims(): Promise<Claim[]>;
  findClaimById(id: string): Promise<Claim | null>;
  updateClaim(claim: Claim): Promise<void>;

  findResponseByReviewId(reviewId: string): Promise<AgencyResponse | null>;
  createAgencyResponse(response: AgencyResponse): Promise<void>;

  listAliasesByAgency(agencyId: string): Promise<AgencyNameAlias[]>;
  listAllAliases(): Promise<AgencyNameAlias[]>;
  createAlias(alias: AgencyNameAlias): Promise<void>;
}
