import type { Repository } from "@/lib/repositories/types";
import { getMemoryStore } from "@/lib/repositories/memory-store";
import { SupabaseRepository } from "@/lib/repositories/supabase-repository";
import { AgencyService } from "@/lib/services/agency-service";
import { AgencySubmissionService } from "@/lib/services/agency-submission-service";
import { AdminService } from "@/lib/services/admin-service";
import { AuthService } from "@/lib/services/auth-service";
import { ClaimService } from "@/lib/services/claim-service";
import { ReviewService } from "@/lib/services/review-service";
import { createSmsProvider } from "@/lib/services/sms-provider";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

function createRepository(): Repository {
  if (isSupabaseConfigured()) {
    return new SupabaseRepository(createServiceClient());
  }
  return getMemoryStore();
}

const repo = createRepository();
const sms = createSmsProvider();
const exposeDevCode =
  process.env.NODE_ENV !== "production" ||
  process.env.EXPOSE_DEV_SMS_CODE === "true";

export const authService = new AuthService(repo, sms, exposeDevCode);
export const agencyService = new AgencyService(repo);
export const agencySubmissionService = new AgencySubmissionService(repo);
export const reviewService = new ReviewService(repo);
export const claimService = new ClaimService(repo);
export const adminService = new AdminService(repo, claimService, agencySubmissionService);

export function usingSupabase() {
  return isSupabaseConfigured();
}
