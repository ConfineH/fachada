import Link from "next/link";
import type { ReactNode } from "react";

import { DevBanner } from "@/components/dev-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { usingSupabase } from "@/lib/container";

export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 text-zinc-900">
      <DevBanner storage={usingSupabase() ? "supabase" : "memory"} />
      <SiteNav />
      <main className="prose prose-stone mx-auto max-w-3xl px-6 py-10">
        <h1>{title}</h1>
        <p className="text-sm text-zinc-500">Última actualización: {updated}</p>
        {children}
        <p>
          <Link href="/">Volver al inicio</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
