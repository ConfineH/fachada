import { SESSION_STORAGE_KEY } from "@/lib/auth/review-errors";

export function readSessionToken() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeSessionToken(token: string) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  } catch {
    // ignore
  }
}

export function clearSessionToken() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
