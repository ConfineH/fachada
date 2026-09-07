export interface SmsProvider {
  sendCode(phone: string, code: string): Promise<void>;
}

export class MockSmsProvider implements SmsProvider {
  sent: Array<{ phone: string; code: string }> = [];

  async sendCode(phone: string, code: string) {
    this.sent.push({ phone, code });
  }

  lastCodeFor(phone: string) {
    return [...this.sent].reverse().find((s) => s.phone === phone)?.code;
  }
}

export class TwilioSmsProvider implements SmsProvider {
  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly fromNumber: string,
  ) {}

  async sendCode(phone: string, code: string) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: phone,
      From: this.fromNumber,
      Body: `Tu código de verificación Fachada: ${code}`,
    });
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
      "base64",
    );
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Twilio SMS failed: ${response.status} ${text}`);
    }
  }
}

export function createSmsProvider(): SmsProvider {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (sid && token && from) {
    return new TwilioSmsProvider(sid, token, from);
  }
  return new MockSmsProvider();
}
