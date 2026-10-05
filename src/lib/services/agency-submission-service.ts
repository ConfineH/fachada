import { randomUUID } from "node:crypto";

import { buildAgencySlug } from "@/lib/domain/agency-slug";
import { brandSlugFromName, companyKey, servesCity } from "@/lib/domain/company-presence";
import { isAccountVerified } from "@/lib/domain/identity";
import type { Agency, AgencyLocation, AgencySubmission, User } from "@/lib/domain/types";
import { agencySubmissionInputSchema } from "@/lib/domain/validation";
import { notifyModerationQueue } from "@/lib/ops/moderation-alert";
import type { Repository } from "@/lib/repositories/types";
import type { EmailProvider } from "@/lib/services/email-provider";

export class AgencySubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgencySubmissionError";
  }
}

export class AgencySubmissionService {
  constructor(
    private readonly repo: Repository,
    private readonly email?: EmailProvider,
  ) {}

  async submit(user: User | undefined, input: unknown): Promise<AgencySubmission> {
    if (!isAccountVerified(user)) {
      throw new AgencySubmissionError("Account verification required");
    }

    const data = agencySubmissionInputSchema.parse(input);

    const existing = await this.findSameCompany(data.name);
    if (existing) {
      const locations = await this.repo.listLocationsByAgency(existing.id);
      if (servesCity(existing, locations, data.city)) {
        throw new AgencySubmissionError(
          "Esa inmobiliaria ya está en esa ciudad. Búscala y deja tu reseña.",
        );
      }
    }

    const pending = await this.repo.listAgencySubmissions();
    const duplicatePending = pending.some(
      (s) =>
        s.status === "pendiente" &&
        companyKey(s.name) === companyKey(data.name) &&
        s.city.trim().toLowerCase() === data.city.trim().toLowerCase(),
    );
    if (duplicatePending) {
      throw new AgencySubmissionError(
        "Ya hay una solicitud pendiente para esa inmobiliaria. La revisaremos pronto.",
      );
    }

    const submission: AgencySubmission = {
      id: randomUUID(),
      userId: user.id,
      name: data.name,
      city: data.city,
      postalCode: data.postalCode,
      address: data.address,
      noPhoneOnline: data.noPhoneOnline,
      phone: data.noPhoneOnline ? undefined : data.phone,
      email: data.email,
      website: data.website,
      idealistaUrl: data.idealistaUrl,
      note: data.note,
      status: "pendiente",
      createdAt: new Date(),
    };

    await this.repo.createAgencySubmission(submission);
    await notifyModerationQueue(this.email, {
      kind: "Inmobiliaria sugerida",
      detail: `${submission.name} (${submission.city}).`,
    });
    return submission;
  }

  async approve(submissionId: string): Promise<Agency> {
    const submission = await this.repo.findAgencySubmissionById(submissionId);
    if (!submission) throw new AgencySubmissionError("Submission not found");
    if (submission.status !== "pendiente") {
      throw new AgencySubmissionError("Submission already resolved");
    }

    const existing = await this.findSameCompany(submission.name);
    if (existing) {
      const locations = await this.repo.listLocationsByAgency(existing.id);
      if (!servesCity(existing, locations, submission.city)) {
        const location: AgencyLocation = {
          id: randomUUID(),
          agencyId: existing.id,
          kind: "branch",
          status: "publicado",
          address: submission.address.trim(),
          city: submission.city.trim(),
          postalCode: submission.postalCode.trim(),
          note: submission.note,
          createdAt: new Date(),
        };
        await this.repo.createLocation(location);
      }
      submission.status = "aprobado";
      submission.resolvedAt = new Date();
      submission.createdAgencyId = existing.id;
      submission.createdAgencySlug = existing.slug;
      await this.repo.updateAgencySubmission(submission);
      return existing;
    }

    const baseSlug = buildAgencySlug(submission.name);
    const slugFinal = await this.resolveUniqueSlug(baseSlug);

    const phonePublished = !submission.noPhoneOnline;
    const agency: Agency = {
      id: randomUUID(),
      slug: slugFinal,
      name: submission.name.trim(),
      brandSlug: brandSlugFromName(submission.name),
      brandName: submission.name.trim(),
      address: submission.address.trim(),
      city: submission.city.trim(),
      postalCode: submission.postalCode.trim(),
      phonePublished,
      phone: phonePublished ? submission.phone!.trim() : "",
      email: submission.email?.trim() ?? "",
      website: submission.website,
      idealistaUrl: submission.idealistaUrl,
      claimed: false,
      verified: false,
      premium: false,
      createdAt: new Date(),
    };

    await this.repo.createAgency(agency);

    submission.status = "aprobado";
    submission.resolvedAt = new Date();
    submission.createdAgencyId = agency.id;
    submission.createdAgencySlug = agency.slug;
    await this.repo.updateAgencySubmission(submission);

    return agency;
  }

  private async findSameCompany(name: string) {
    const key = companyKey(name);
    const agencies = await this.repo.listAgencies();
    return agencies.find((agency) => companyKey(agency.name) === key) ?? null;
  }

  private async resolveUniqueSlug(base: string) {
    let slug = base;
    let i = 2;
    while (await this.repo.findAgencyBySlug(slug)) {
      slug = `${base}-${i}`;
      i += 1;
    }
    return slug;
  }

  async reject(submissionId: string) {
    const submission = await this.repo.findAgencySubmissionById(submissionId);
    if (!submission) throw new AgencySubmissionError("Submission not found");
    if (submission.status !== "pendiente") {
      throw new AgencySubmissionError("Submission already resolved");
    }
    submission.status = "rechazado";
    submission.resolvedAt = new Date();
    await this.repo.updateAgencySubmission(submission);
    return submission;
  }
}
