import { getStore } from "@/lib/repositories/memory-store";
import { AgencyService } from "@/lib/services/agency-service";
import { AuthService } from "@/lib/services/auth-service";
import { ClaimService } from "@/lib/services/claim-service";
import { ReviewService } from "@/lib/services/review-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

const store = getStore();
const sms = new MockSmsProvider();

export const authService = new AuthService(store, sms);
export const agencyService = new AgencyService(store);
export const reviewService = new ReviewService(store);
export const claimService = new ClaimService(store);

export { store };
