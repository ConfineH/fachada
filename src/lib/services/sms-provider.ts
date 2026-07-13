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
