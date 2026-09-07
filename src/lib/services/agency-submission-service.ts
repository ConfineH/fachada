import { randomUUID } from "node:crypto";

import { buildAgencySlug } from "@/lib/domain/agency-slug";
import { isAccountVerified } from "@/lib/domain/identity";
import type { Agency, AgencySubmission, User } from "@/lib/domain/types";
import { agencySubmissionInputSchema } from "@/lib/domain/validation";
import type { Repository } from "@/lib/repositories/types";

export class AgencySubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgencySubmissionError";
  }
}

export class AgencySubmissionService {
  constructor(private readonly repo: Repository) {}

  async submit(user: User | undefined, input: unknown): Promise<AgencySubmission> {
    if (!isAccountVerified(user)) {
      throw new AgencySubmissionError("Account verification required");
    }

    const data = agencySubmissionInputSchema.parse(input);
    const normalizedName = data.name.trim().toLowerCase();
    const normalizedCity = data.city.trim().toLowerCase();

    const agencies = await this.repo.listAgencies();
    const duplicate = agencies.some(
      (a) =>
        a.name.trim().toLowerCase() === normalizedName &&
        a.city.trim().toLowerCase() === normalizedCity,
    );
    if (duplicate) {
      throw new AgencySubmissionError(
        "Ya existe una inmobiliaria con ese nombre en esa ciudad. Búscala y deja tu reseña.",
      );
    }

    const pending = await this.repo.listAgencySubmissions();
    const duplicatePending = pending.some(
      (s) =>
        s.status === "pendiente" &&
        s.name.trim().toLowerCase() === normalizedName &&
        s.city.trim().toLowerCase() === normalizedCity,
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
    return submission;
  }

  async approve(submissionId: string): Promise<Agency> {
    const submission = await this.repo.findAgencySubmissionById(submissionId);
    if (!submission) throw new AgencySubmissionError("Submission not found");
    if (submission.status !== "pendiente") {
      throw new AgencySubmissionError("Submission already resolved");
    }

    const baseSlug = buildAgencySlug(submission.name, submission.city);
    const slugFinal = await this.resolveUniqueSlug(baseSlug);

    const phonePublished = !submission.noPhoneOnline;
    const agency: Agency = {
      id: randomUUID(),
      slug: slugFinal,
      name: submission.name.trim(),
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
