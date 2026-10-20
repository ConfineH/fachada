import { PublicShell } from "@/components/public-shell";
import { usingSupabase } from "@/lib/container";

export default function HerramientasLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      {children}
    </PublicShell>
  );
}
