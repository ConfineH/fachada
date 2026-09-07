import type { User } from "@/lib/domain/types";

export function isAccountVerified(user: User | undefined): user is User {
  return Boolean(user && (user.emailVerified || user.phoneVerified));
}
