import { beforeEach, describe, expect, it } from "vitest";

import { MemoryStore } from "@/lib/repositories/memory-store";
import { AccountError, AccountService } from "@/lib/services/account-service";
import { AuthService } from "@/lib/services/auth-service";
import { MockSmsProvider } from "@/lib/services/sms-provider";

describe("AccountService", () => {
  let store: MemoryStore;
  let auth: AuthService;
  let sms: MockSmsProvider;
  let service: AccountService;
  let agencyId: string;

  beforeEach(async () => {
    store = new MemoryStore();
    sms = new MockSmsProvider();
    auth = new AuthService(store, sms);
    service = new AccountService(store);
    agencyId = (await store.listAgencies())[0]!.id;
  });

  async function verifiedUser() {
    await auth.requestCode("+34600111222");
    const code = sms.lastCodeFor("+34600111222")!;
    const session = await auth.verifyCode("+34600111222", code);
    return auth.getUserFromSession(session.token);
  }

  it("saves and lists agencies", async () => {
    const user = await verifiedUser();
    await service.saveAgency(user, agencyId);
    const dash = await service.dashboard(user!);
    expect(dash.saved).toHaveLength(1);
    expect(dash.saved[0]?.id).toBe(agencyId);
  });

  it("rejects save without verification", async () => {
    const user = await store.createUser({ phone: "+34600999888" });
    await expect(service.saveAgency(user, agencyId)).rejects.toThrow(AccountError);
  });
});
