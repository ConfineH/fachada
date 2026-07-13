import { randomBytes, randomInt } from "node:crypto";

import type { Session } from "@/lib/domain/types";
import { spanishPhoneSchema, verificationCodeSchema } from "@/lib/domain/validation";
import type { Repository } from "@/lib/repositories/types";
import type { SmsProvider } from "@/lib/services/sms-provider";

const CODE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthService {
  constructor(
    private readonly repo: Repository,
    private readonly sms: SmsProvider,
  ) {}

  async requestCode(rawPhone: string) {
    const phone = spanishPhoneSchema.parse(rawPhone);
    const code = String(randomInt(100000, 999999));

    let user = this.repo.findUserByPhone(phone);
    if (!user) user = this.repo.createUser(phone);

    this.repo.savePendingVerification({
      phone,
      code,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    await this.sms.sendCode(phone, code);
    return { phone, userId: user.id };
  }

  verifyCode(rawPhone: string, rawCode: string): Session {
    const phone = spanishPhoneSchema.parse(rawPhone);
    const code = verificationCodeSchema.parse(rawCode);

    const pending = this.repo.getPendingVerification(phone);
    if (!pending) throw new AuthError("No pending verification");
    if (pending.expiresAt < new Date()) {
      this.repo.deletePendingVerification(phone);
      throw new AuthError("Verification code expired");
    }
    if (pending.code !== code) throw new AuthError("Invalid verification code");

    const user = this.repo.findUserByPhone(phone);
    if (!user) throw new AuthError("User not found");

    user.phoneVerified = true;
    user.lastActivityAt = new Date();
    this.repo.updateUser(user);
    this.repo.deletePendingVerification(phone);

    const session: Session = {
      token: randomBytes(32).toString("hex"),
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    };
    this.repo.createSession(session);
    return session;
  }

  getUserFromSession(token: string | undefined) {
    if (!token) return undefined;
    const session = this.repo.findSessionByToken(token);
    if (!session || session.expiresAt < new Date()) return undefined;
    return this.repo.findUserById(session.userId);
  }
}
