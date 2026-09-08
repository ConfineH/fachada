import { PublicShell } from "@/components/public-shell";
import { AccountHome } from "@/components/account-home";
import { usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Tu cuenta — Fachada",
  description: "Reseñas enviadas e inmobiliarias guardadas.",
};

export default function CuentaPage() {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <AccountHome />
      </main>
    </PublicShell>
  );
}
