import { randomUUID } from "node:crypto";

import type {
  Agency,
  AgencyResponse,
  Claim,
  PendingVerification,
  Review,
  Session,
  User,
} from "@/lib/domain/types";

import type { Repository } from "./types";

const MADRID_AGENCIES: Omit<Agency, "id" | "createdAt">[] = [
  {
    slug: "inmobiliaria-sol-madrid",
    name: "Inmobiliaria Sol",
    address: "Calle Mayor 12",
    city: "Madrid",
    postalCode: "28013",
    phone: "+34911222333",
    email: "info@inmobiliariasol.es",
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
    email: "contacto@pisosbarcelona.es",
    claimed: false,
    verified: false,
    premium: false,
  },
];

export class MemoryStore implements Repository {
  private users = new Map<string, User>();
  private usersByPhone = new Map<string, string>();
  private pendingVerifications = new Map<string, PendingVerification>();
  private sessions = new Map<string, Session>();
  private agencies = new Map<string, Agency>();
  private agenciesBySlug = new Map<string, string>();
  private reviews: Review[] = [];
  private claims: Claim[] = [];
  private responses = new Map<string, AgencyResponse>();

  constructor() {
    this.seedAgencies();
  }

  private seedAgencies() {
    for (const seed of MADRID_AGENCIES) {
      const agency: Agency = {
        ...seed,
        id: randomUUID(),
        createdAt: new Date(),
      };
      this.agencies.set(agency.id, agency);
      this.agenciesBySlug.set(agency.slug, agency.id);
    }
  }

  reset() {
    this.users.clear();
    this.usersByPhone.clear();
    this.pendingVerifications.clear();
    this.sessions.clear();
    this.agencies.clear();
    this.agenciesBySlug.clear();
    this.reviews = [];
    this.claims = [];
    this.responses.clear();
    this.seedAgencies();
  }

  findUserByPhone(phone: string) {
    const id = this.usersByPhone.get(phone);
    return id ? this.users.get(id) : undefined;
  }

  findUserById(id: string) {
    return this.users.get(id);
  }

  createUser(phone: string): User {
    const user: User = {
      id: randomUUID(),
      phone,
      phoneVerified: false,
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };
    this.users.set(user.id, user);
    this.usersByPhone.set(phone, user.id);
    return user;
  }

  updateUser(user: User) {
    this.users.set(user.id, user);
  }

  savePendingVerification(verification: PendingVerification) {
    this.pendingVerifications.set(verification.phone, verification);
  }

  getPendingVerification(phone: string) {
    return this.pendingVerifications.get(phone);
  }

  deletePendingVerification(phone: string) {
    this.pendingVerifications.delete(phone);
  }

  createSession(session: Session) {
    this.sessions.set(session.token, session);
  }

  findSessionByToken(token: string) {
    return this.sessions.get(token);
  }

  listAgencies() {
    return [...this.agencies.values()];
  }

  findAgencyById(id: string) {
    return this.agencies.get(id);
  }

  findAgencyBySlug(slug: string) {
    const id = this.agenciesBySlug.get(slug);
    return id ? this.agencies.get(id) : undefined;
  }

  updateAgency(agency: Agency) {
    this.agencies.set(agency.id, agency);
    this.agenciesBySlug.set(agency.slug, agency.id);
  }

  listReviewsByAgency(agencyId: string) {
    return this.reviews.filter((r) => r.agencyId === agencyId);
  }

  listReviewsByUser(userId: string) {
    return this.reviews.filter((r) => r.userId === userId);
  }

  createReview(review: Review) {
    this.reviews.push(review);
  }

  createClaim(claim: Claim) {
    this.claims.push(claim);
  }

  listClaims() {
    return [...this.claims];
  }

  findClaimById(id: string) {
    return this.claims.find((c) => c.id === id);
  }

  updateClaim(claim: Claim) {
    const index = this.claims.findIndex((c) => c.id === claim.id);
    if (index >= 0) this.claims[index] = claim;
  }

  findResponseByReviewId(reviewId: string) {
    return this.responses.get(reviewId);
  }

  createAgencyResponse(response: AgencyResponse) {
    this.responses.set(response.reviewId, response);
  }
}

let globalStore: MemoryStore | null = null;

export function getStore(): MemoryStore {
  if (!globalStore) globalStore = new MemoryStore();
  return globalStore;
}

export function resetStore() {
  if (globalStore) globalStore.reset();
}
