import { PublicShell } from "@/components/public-shell";
import { AccountHome } from "@/components/account-home";
import { usingSupabase } from "@/lib/container";
import { getLegal } from "@/lib/legal";

export const metadata = {
  title: "Tu cuenta",
  description: "Reseñas enviadas e inmobiliarias guardadas.",
  robots: { index: false, follow: false },
};

export default function CuentaPage() {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <AccountHome privacyEmail={getLegal().privacyEmail} />
      </main>
    </PublicShell>
  );
}
