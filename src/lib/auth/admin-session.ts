import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "fachada_admin";
const MAX_AGE_SEC = 60 * 60 * 8;

function getAdminSecret() {
  return process.env.ADMIN_PASSWORD ?? "fachada-admin-dev";
}

function sign(value: string) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("hex");
}

export function createAdminToken() {
  const expiresAt = Date.now() + MAX_AGE_SEC * 1000;
  const payload = `admin:${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expiresAt = Number(payload.split(":")[1]);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminSecret();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

export { COOKIE_NAME };
