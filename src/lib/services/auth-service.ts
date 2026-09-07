import { randomBytes, randomInt } from "node:crypto";

import type { Session, User } from "@/lib/domain/types";
import { agencyHasPublishedPhone } from "@/lib/domain/agency-contact";
import { maskSpanishPhone } from "@/lib/domain/claim-verification";
import {
  accountEmailSchema,
  spanishBusinessPhoneSchema,
  spanishPhoneSchema,
  verificationCodeSchema,
} from "@/lib/domain/validation";
import type { Repository } from "@/lib/repositories/types";
import {
  isResendConfigured,
  MockEmailProvider,
  type EmailProvider,
} from "@/lib/services/email-provider";
import { verifyGoogleIdToken } from "@/lib/services/google-auth";
import {
  isTwilioConfigured,
  type SmsProvider,
} from "@/lib/services/sms-provider";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BUSINESS_LINE_CLAIM_WINDOW_MS = 30 * 60 * 1000;

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

type GoogleVerifier = (idToken: string) => Promise<string>;

export class AuthService {
  constructor(
    private readonly repo: Repository,
    private readonly sms: SmsProvider,
    private readonly exposeDevCode = false,
    private readonly email: EmailProvider = new MockEmailProvider(),
    private readonly exposeEmailDevCode = exposeDevCode,
    private readonly googleVerifier: GoogleVerifier = verifyGoogleIdToken,
  ) {}

  private assertCanSendSms() {
    if (process.env.NODE_ENV === "production" && !isTwilioConfigured()) {
      throw new AuthError("SMS provider not configured");
    }
  }

  private assertCanSendEmail() {
    if (process.env.NODE_ENV === "production" && !isResendConfigured()) {
      throw new AuthError("Email provider not configured");
    }
  }

  private async assertResendCooldown(phone: string) {
    const pending = await this.repo.getPendingVerification(phone);
    if (!pending) return;
    const sentAt = pending.expiresAt.getTime() - CODE_TTL_MS;
    if (Date.now() - sentAt < RESEND_COOLDOWN_MS) {
      throw new AuthError("Verification code recently sent");
    }
  }

  private async assertEmailResendCooldown(email: string) {
    const pending = await this.repo.getPendingEmailVerification(email);
    if (!pending) return;
    const sentAt = pending.expiresAt.getTime() - CODE_TTL_MS;
    if (Date.now() - sentAt < RESEND_COOLDOWN_MS) {
      throw new AuthError("Verification code recently sent");
    }
  }

  private async createSession(user: User): Promise<Session> {
    const session: Session = {
      token: randomBytes(32).toString("hex"),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    };
    await this.repo.createSession(session);
    return session;
  }

  async requestCode(rawPhone: string) {
    this.assertCanSendSms();
    const phone = spanishPhoneSchema.parse(rawPhone);
    await this.assertResendCooldown(phone);
    const code = String(randomInt(100000, 999999));

    let user = await this.repo.findUserByPhone(phone);
    if (!user) user = await this.repo.createUser({ phone });

    await this.repo.savePendingVerification({
      phone,
      code,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    await this.sms.sendCode(phone, code);
    return {
      phone,
      userId: user.id,
      ...(this.exposeDevCode ? { devCode: code } : {}),
    };
  }

  async verifyCode(rawPhone: string, rawCode: string): Promise<Session> {
    const phone = spanishPhoneSchema.parse(rawPhone);
    const code = verificationCodeSchema.parse(rawCode);

    const pending = await this.repo.getPendingVerification(phone);
    if (!pending) throw new AuthError("No pending verification");
    if (pending.expiresAt < new Date()) {
      await this.repo.deletePendingVerification(phone);
      throw new AuthError("Verification code expired");
    }
    if (pending.code !== code) throw new AuthError("Invalid verification code");

    const user = await this.repo.findUserByPhone(phone);
    if (!user) throw new AuthError("User not found");

    user.phoneVerified = true;
    user.lastActivityAt = new Date();
    await this.repo.updateUser(user);
    await this.repo.deletePendingVerification(phone);
    return this.createSession(user);
  }

  async requestEmailCode(rawEmail: string) {
    this.assertCanSendEmail();
    const email = accountEmailSchema.parse(rawEmail);
    await this.assertEmailResendCooldown(email);
    const code = String(randomInt(100000, 999999));

    let user = await this.repo.findUserByEmail(email);
    if (!user) user = await this.repo.createUser({ email });

    await this.repo.savePendingEmailVerification({
      email,
      code,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    try {
      await this.email.sendCode(email, code);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Email send failed";
      throw new AuthError(
        detail.startsWith("Email send failed") ? detail : `Email send failed: ${detail}`,
      );
    }
    return {
      email,
      userId: user.id,
      ...(this.exposeEmailDevCode ? { devCode: code } : {}),
    };
  }

  async verifyEmailCode(rawEmail: string, rawCode: string): Promise<Session> {
    const email = accountEmailSchema.parse(rawEmail);
    const code = verificationCodeSchema.parse(rawCode);

    const pending = await this.repo.getPendingEmailVerification(email);
    if (!pending) throw new AuthError("No pending verification");
    if (pending.expiresAt < new Date()) {
      await this.repo.deletePendingEmailVerification(email);
      throw new AuthError("Verification code expired");
    }
    if (pending.code !== code) throw new AuthError("Invalid verification code");

    const user = await this.repo.findUserByEmail(email);
    if (!user) throw new AuthError("User not found");

    user.email = email;
    user.emailVerified = true;
    user.lastActivityAt = new Date();
    await this.repo.updateUser(user);
    await this.repo.deletePendingEmailVerification(email);
    return this.createSession(user);
  }

  async signInWithGoogle(idToken: string): Promise<Session> {
    if (!idToken?.trim()) throw new AuthError("Invalid Google token");
    let email: string;
    try {
      email = await this.googleVerifier(idToken);
    } catch {
      throw new AuthError("Invalid Google token");
    }
    let user = await this.repo.findUserByEmail(email);
    if (!user) user = await this.repo.createUser({ email });

    user.email = email;
    user.emailVerified = true;
    user.lastActivityAt = new Date();
    await this.repo.updateUser(user);
    return this.createSession(user);
  }

  async getUserFromSession(token: string | undefined) {
    if (!token) return undefined;
    const session = await this.repo.findSessionByToken(token);
    if (!session || session.expiresAt < new Date()) return undefined;
    return (await this.repo.findUserById(session.userId)) ?? undefined;
  }

  /** Google Business Profile–style: OTP al teléfono publicado de la agencia. */
  async requestAgencyBusinessCode(userId: string, agencyId: string) {
    this.assertCanSendSms();
    const agency = await this.repo.findAgencyById(agencyId);
    if (!agency) throw new AuthError("Agency not found");
    if (!agencyHasPublishedPhone(agency)) {
      throw new AuthError(
        "Esta inmobiliaria no tiene teléfono público; usa el reclamo documental",
      );
    }

    const phone = spanishBusinessPhoneSchema.parse(agency.phone);
    const code = String(randomInt(100000, 999999));

    await this.repo.savePendingBusinessLineVerification(userId, agencyId, {
      phone,
      code,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    await this.sms.sendCode(phone, code);
    return {
      phoneHint: maskSpanishPhone(phone),
      ...(this.exposeDevCode ? { devCode: code } : {}),
    };
  }

  async verifyAgencyBusinessCode(
    userId: string,
    agencyId: string,
    rawCode: string,
  ) {
    const code = verificationCodeSchema.parse(rawCode);
    const pending = await this.repo.getPendingBusinessLineVerification(
      userId,
      agencyId,
    );
    if (!pending) throw new AuthError("No pending business verification");
    if (pending.expiresAt < new Date()) {
      await this.repo.deletePendingBusinessLineVerification(userId, agencyId);
      throw new AuthError("Verification code expired");
    }
    if (pending.code !== code) throw new AuthError("Invalid verification code");

    await this.repo.deletePendingBusinessLineVerification(userId, agencyId);
    await this.repo.markBusinessLineVerified(
      userId,
      agencyId,
      new Date(Date.now() + BUSINESS_LINE_CLAIM_WINDOW_MS),
    );
    return { verified: true };
  }
}
