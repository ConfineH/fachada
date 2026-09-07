import { randomUUID } from "node:crypto";

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
import {
  DEMO_ALIASES,
  DEMO_REVIEWS,
  createDemoUserId,
} from "@/lib/seed/demo-content";

import { stableEntityId } from "@/lib/domain/stable-id";

import type { Repository } from "./types";

const MADRID_AGENCIES: Omit<Agency, "id" | "createdAt">[] = [
  {
    slug: "inmobiliaria-sol-madrid",
    name: "Inmobiliaria Sol",
    cif: "B12345678",
    legalName: "Inmobiliaria Sol Madrid S.L.",
    address: "Calle Mayor 12",
    legalAddress: "Calle Alcalá 100, 28009 Madrid (domicilio social)",
    city: "Madrid",
    postalCode: "28013",
    phone: "+34911222333",
    phonePublished: true,
    email: "info@inmobiliariasol.es",
    website: "https://www.inmobiliariasol.es",
    claimed: false,
    verified: false,
    premium: false,
  },
  {
    slug: "gestion-urbana-madrid",
    name: "Gestión Urbana",
    address: "Gran Vía 45",
    city: "Madrid",
    postalCode: "28013",
    phone: "+34911444555",
    phonePublished: true,
    email: "hola@gestionurbana.es",
    claimed: false,
    verified: false,
    premium: false,
  },
  {
    slug: "pisos-barcelona",
    name: "Pisos Barcelona",
    address: "Passeig de Gràcia 1",
    city: "Barcelona",
    postalCode: "08007",
    phone: "+34933666777",
    phonePublished: true,
    email: "contacto@pisosbarcelona.es",
    claimed: false,
    verified: false,
    premium: false,
  },
  {
    slug: "inmobiliaria-javier-valencia",
    name: "Inmobiliaria Javier",
    address: "Calle Colón 28",
    city: "Valencia",
    postalCode: "46004",
    phone: "+34961222333",
    phonePublished: true,
    email: "hola@inmobiliariajavier.es",
    idealistaUrl: "https://www.idealista.com/pro/inmobiliaria-javier/",
    claimed: false,
    verified: false,
    premium: false,
  },
];

export class MemoryStore implements Repository {
  private users = new Map<string, User>();
  private usersByPhone = new Map<string, string>();
  private usersByEmail = new Map<string, string>();
  private pendingVerifications = new Map<string, PendingVerification>();
  private pendingEmailVerifications = new Map<string, PendingEmailVerification>();
  private sessions = new Map<string, Session>();
  private agencies = new Map<string, Agency>();
  private agenciesBySlug = new Map<string, string>();
  private reviews: Review[] = [];
  private claims: Claim[] = [];
  private responses = new Map<string, AgencyResponse>();
  private aliases: AgencyNameAlias[] = [];
  private submissions: AgencySubmission[] = [];
  private pendingBusinessLine = new Map<string, PendingVerification>();
  private businessLineVerified = new Map<string, Date>();

  private businessKey(userId: string, agencyId: string) {
    return `${userId}:${agencyId}`;
  }

  constructor() {
    this.seedAgencies();
    this.seedDemoContent();
  }

  private seedAgencies() {
    for (const seed of MADRID_AGENCIES) {
      const agency: Agency = {
        ...seed,
        id: stableEntityId("agency", seed.slug),
        createdAt: new Date(),
      };
      this.agencies.set(agency.id, agency);
      this.agenciesBySlug.set(agency.slug, agency.id);
    }
  }

  reset() {
    this.users.clear();
    this.usersByPhone.clear();
    this.usersByEmail.clear();
    this.pendingVerifications.clear();
    this.pendingEmailVerifications.clear();
    this.sessions.clear();
    this.agencies.clear();
    this.agenciesBySlug.clear();
    this.reviews = [];
    this.claims = [];
    this.responses.clear();
    this.aliases = [];
    this.submissions = [];
    this.pendingBusinessLine.clear();
    this.businessLineVerified.clear();
    this.seedAgencies();
    this.seedDemoContent();
  }

  private seedDemoContent() {
    const demoUserId = createDemoUserId();
    for (const seed of DEMO_REVIEWS) {
      const agencyId = this.agenciesBySlug.get(seed.agencySlug);
      if (!agencyId) continue;
      const review: Review = {
        id: randomUUID(),
        userId: demoUserId,
        agencyId,
        role: seed.role,
        rating: seed.rating,
        title: seed.title,
        body: seed.body,
        incidentTags: seed.incidentTags,
        createdAt: new Date(),
        moderated: seed.moderated,
        flagged: seed.flagged,
      };
      this.reviews.push(review);
    }

    for (const seed of DEMO_ALIASES) {
      const agencyId = this.agenciesBySlug.get(seed.agencySlug);
      if (!agencyId) continue;
      this.aliases.push({
        id: randomUUID(),
        agencyId,
        alias: seed.alias,
        kind: seed.kind,
        effectiveUntil: seed.effectiveUntil,
        sourceUrl: seed.sourceUrl,
        note: seed.note,
      });
    }
  }

  async findUserByPhone(phone: string) {
    const id = this.usersByPhone.get(phone);
    return id ? (this.users.get(id) ?? null) : null;
  }

  async findUserByEmail(email: string) {
    const id = this.usersByEmail.get(email.toLowerCase());
    return id ? (this.users.get(id) ?? null) : null;
  }

  async findUserById(id: string) {
    return this.users.get(id) ?? null;
  }

  async createUser(input: { phone?: string; email?: string }) {
    const email = input.email?.toLowerCase();
    const user: User = {
      id: randomUUID(),
      phone: input.phone,
      email,
      phoneVerified: false,
      emailVerified: false,
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };
    this.users.set(user.id, user);
    if (user.phone) this.usersByPhone.set(user.phone, user.id);
    if (email) this.usersByEmail.set(email, user.id);
    return user;
  }

  async updateUser(user: User) {
    this.users.set(user.id, user);
    if (user.phone) this.usersByPhone.set(user.phone, user.id);
    if (user.email) this.usersByEmail.set(user.email.toLowerCase(), user.id);
  }

  async savePendingVerification(verification: PendingVerification) {
    this.pendingVerifications.set(verification.phone, verification);
  }

  async getPendingVerification(phone: string) {
    return this.pendingVerifications.get(phone) ?? null;
  }

  async deletePendingVerification(phone: string) {
    this.pendingVerifications.delete(phone);
  }

  async savePendingEmailVerification(verification: PendingEmailVerification) {
    this.pendingEmailVerifications.set(
      verification.email.toLowerCase(),
      { ...verification, email: verification.email.toLowerCase() },
    );
  }

  async getPendingEmailVerification(email: string) {
    return this.pendingEmailVerifications.get(email.toLowerCase()) ?? null;
  }

  async deletePendingEmailVerification(email: string) {
    this.pendingEmailVerifications.delete(email.toLowerCase());
  }

  async createSession(session: Session) {
    this.sessions.set(session.token, session);
  }

  async findSessionByToken(token: string) {
    return this.sessions.get(token) ?? null;
  }

  async listAgencies() {
    return [...this.agencies.values()];
  }

  async findAgencyById(id: string) {
    return this.agencies.get(id) ?? null;
  }

  async findAgencyBySlug(slug: string) {
    const id = this.agenciesBySlug.get(slug);
    return id ? (this.agencies.get(id) ?? null) : null;
  }

  async updateAgency(agency: Agency) {
    this.agencies.set(agency.id, agency);
    this.agenciesBySlug.set(agency.slug, agency.id);
  }

  async createAgency(agency: Agency) {
    if (this.agenciesBySlug.has(agency.slug)) {
      throw new Error("Agency slug already exists");
    }
    this.agencies.set(agency.id, agency);
    this.agenciesBySlug.set(agency.slug, agency.id);
  }

  async createAgencySubmission(submission: AgencySubmission) {
    this.submissions.push(submission);
  }

  async listAgencySubmissions() {
    return [...this.submissions].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async findAgencySubmissionById(id: string) {
    return this.submissions.find((s) => s.id === id) ?? null;
  }

  async updateAgencySubmission(submission: AgencySubmission) {
    const index = this.submissions.findIndex((s) => s.id === submission.id);
    if (index >= 0) this.submissions[index] = submission;
  }

  async listReviewsByAgency(agencyId: string) {
    return this.reviews.filter((r) => r.agencyId === agencyId);
  }

  async listReviewsByUser(userId: string) {
    return this.reviews.filter((r) => r.userId === userId);
  }

  async listAllReviews() {
    return [...this.reviews].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async findReviewById(id: string) {
    return this.reviews.find((r) => r.id === id) ?? null;
  }

  async updateReview(review: Review) {
    const index = this.reviews.findIndex((r) => r.id === review.id);
    if (index >= 0) this.reviews[index] = review;
  }

  async createReview(review: Review) {
    this.reviews.push(review);
  }

  async createClaim(claim: Claim) {
    this.claims.push(claim);
  }

  async listClaims() {
    return [...this.claims];
  }

  async findClaimById(id: string) {
    return this.claims.find((c) => c.id === id) ?? null;
  }

  async updateClaim(claim: Claim) {
    const index = this.claims.findIndex((c) => c.id === claim.id);
    if (index >= 0) this.claims[index] = claim;
  }

  async findResponseByReviewId(reviewId: string) {
    return this.responses.get(reviewId) ?? null;
  }

  async createAgencyResponse(response: AgencyResponse) {
    this.responses.set(response.reviewId, response);
  }

  async listAliasesByAgency(agencyId: string) {
    return this.aliases.filter((a) => a.agencyId === agencyId);
  }

  async listAllAliases() {
    return [...this.aliases];
  }

  async createAlias(alias: AgencyNameAlias) {
    this.aliases.push(alias);
  }

  async savePendingBusinessLineVerification(
    userId: string,
    agencyId: string,
    verification: PendingVerification,
  ) {
    this.pendingBusinessLine.set(
      this.businessKey(userId, agencyId),
      verification,
    );
  }

  async getPendingBusinessLineVerification(userId: string, agencyId: string) {
    return (
      this.pendingBusinessLine.get(this.businessKey(userId, agencyId)) ?? null
    );
  }

  async deletePendingBusinessLineVerification(userId: string, agencyId: string) {
    this.pendingBusinessLine.delete(this.businessKey(userId, agencyId));
  }

  async markBusinessLineVerified(
    userId: string,
    agencyId: string,
    expiresAt: Date,
  ) {
    this.businessLineVerified.set(this.businessKey(userId, agencyId), expiresAt);
  }

  async hasBusinessLineVerified(userId: string, agencyId: string) {
    const expiresAt = this.businessLineVerified.get(
      this.businessKey(userId, agencyId),
    );
    if (!expiresAt) return false;
    if (expiresAt < new Date()) {
      this.businessLineVerified.delete(this.businessKey(userId, agencyId));
      return false;
    }
    return true;
  }

  async clearBusinessLineVerified(userId: string, agencyId: string) {
    this.businessLineVerified.delete(this.businessKey(userId, agencyId));
  }
}

let globalStore: MemoryStore | null = null;

const MEMORY_STORE_KEY = Symbol.for("fachada.memoryStore");

export function getMemoryStore(): MemoryStore {
  const globalRef = globalThis as typeof globalThis & {
    [MEMORY_STORE_KEY]?: MemoryStore;
  };
  if (globalRef[MEMORY_STORE_KEY]) {
    return globalRef[MEMORY_STORE_KEY];
  }
  if (!globalStore) globalStore = new MemoryStore();
  globalRef[MEMORY_STORE_KEY] = globalStore;
  return globalStore;
}

export function resetStore() {
  if (globalStore) globalStore.reset();
}
