import type { Repository } from "@/lib/repositories/types";
import { getMemoryStore } from "@/lib/repositories/memory-store";
import { SupabaseRepository } from "@/lib/repositories/supabase-repository";
import { AgencyService } from "@/lib/services/agency-service";
import { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import { AdminService } from "@/lib/services/admin-service";
import { AuthService } from "@/lib/services/auth-service";
import { AccountService } from "@/lib/services/account-service";
import { ClaimService } from "@/lib/services/claim-service";
import { ReviewService } from "@/lib/services/review-service";
import { createEmailProvider, isResendConfigured } from "@/lib/services/email-provider";
import {
  createSmsProvider,
  isTwilioConfigured,
} from "@/lib/services/sms-provider";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

function createRepository(): Repository {
  if (isSupabaseConfigured()) {
    return new SupabaseRepository(createServiceClient());
  }
  return getMemoryStore();
}

const repo = createRepository();
const sms = createSmsProvider();
const email = createEmailProvider();
const exposeDevCode =
  !isTwilioConfigured() && process.env.NODE_ENV !== "production";
const exposeEmailDevCode =
  !isResendConfigured() && process.env.NODE_ENV !== "production";

export const authService = new AuthService(
  repo,
  sms,
  exposeDevCode,
  email,
  exposeEmailDevCode,
);
export const agencyService = new AgencyService(repo);
export const agencySubmissionService = new AgencySubmissionService(repo);
export const reviewService = new ReviewService(repo);
export const accountService = new AccountService(repo);
export const claimService = new ClaimService(repo, isTwilioConfigured());
export const adminService = new AdminService(repo, claimService, agencySubmissionService);

export function usingSupabase() {
  return isSupabaseConfigured();
}
