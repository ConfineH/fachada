import { DevBanner } from "@/components/dev-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export function PublicShell({
  storage,
  children,
}: {
  storage: "memory" | "supabase";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-zinc-900">
      <DevBanner storage={storage} />
      <SiteNav />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
