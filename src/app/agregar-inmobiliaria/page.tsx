import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { SuggestAgencyForm } from "@/components/suggest-agency-form";
import { usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Añadir inmobiliaria — Fachada",
  description:
    "Sugiere una inmobiliaria que no aparece en Fachada. La publicamos tras revisar los datos.",
};

export default function AgregarInmobiliariaPage() {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <p
          className="pointer-events-none absolute right-6 top-4 select-none text-[8rem] font-bold leading-none text-zinc-100 sm:right-12 sm:text-[10rem]"
          aria-hidden
        >
          01
        </p>
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="motion-fade-rise flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
                Añadir inmobiliaria
              </h1>
              <p className="mt-3 max-w-2xl text-zinc-600">
                Ayúdanos a mantener el registro actualizado. Los datos serán
                revisados por un moderador antes de publicarse.
              </p>
            </div>
            <span className="badge-trust shrink-0">Proceso seguro</span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link href="/" className="link-brand text-sm">
          ← Volver al buscador
        </Link>
        <div className="mt-8">
          <SuggestAgencyForm />
        </div>
      </main>
    </PublicShell>
  );
}
