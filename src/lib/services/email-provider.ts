export interface EmailProvider {
  sendCode(email: string, code: string): Promise<void>;
}

export class MockEmailProvider implements EmailProvider {
  sent: Array<{ email: string; code: string }> = [];

  async sendCode(email: string, code: string) {
    this.sent.push({ email, code });
  }

  lastCodeFor(email: string) {
    return [...this.sent].reverse().find((s) => s.email === email)?.code;
  }
}

export class ResendEmailProvider implements EmailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async sendCode(email: string, code: string) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [email],
        subject: "Tu código de Fachada",
        text: `Tu código de verificación Fachada es ${code}. Caduca en 10 minutos.`,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Email send failed: ${response.status} ${text}`);
    }
  }
}

export function isResendConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim(),
  );
}

/** Local/dev can mock OTP. Vercel production needs Resend. */
export function isEmailAuthEnabled() {
  return isResendConfigured() || process.env.NODE_ENV !== "production";
}

export function createEmailProvider(): EmailProvider {
  if (isResendConfigured()) {
    return new ResendEmailProvider(
      process.env.RESEND_API_KEY!,
      process.env.EMAIL_FROM!,
    );
  }
  return new MockEmailProvider();
}
