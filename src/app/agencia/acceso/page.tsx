import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { SearchForm } from "@/components/search-form";
import { usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Acceso agencias — Fachada",
  description:
    "Reclama la ficha de tu inmobiliaria, responde reseñas y completa los datos públicos.",
};

export default function AccesoAgenciasPage() {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Portal inmobiliaria
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Acceso agencias
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Si representas una inmobiliaria, busca la ficha, reclámala y espera
          la aprobación. Después puedes responder reseñas y editar enlaces
          públicos.
        </p>

        <ol className="mt-10 space-y-4 text-sm text-zinc-700">
          <li>
            <strong className="text-zinc-900">1. Encuentra la ficha.</strong>{" "}
            Usa el buscador o el directorio por ciudad.
          </li>
          <li>
            <strong className="text-zinc-900">2. Reclama.</strong> En la ficha
            pública, identifica tu cuenta, aporta email corporativo y
            documentación. Si la ficha tiene teléfono publicado, también lo
            contrastamos cuando ese canal está activo.
          </li>
          <li>
            <strong className="text-zinc-900">3. Panel.</strong> Cuando esté
            aprobado, entra en el panel de esa agencia para responder y
            completar Idealista, Fotocasa o alias.
          </li>
        </ol>

        <div className="mt-10">
          <SearchForm variant="hero" />
        </div>

        <p className="mt-8 text-sm text-zinc-600">
          ¿No está en el archivo?{" "}
          <Link href="/agregar-inmobiliaria" className="link-brand">
            Sugerir alta
          </Link>
          . El panel concreto vive en{" "}
          <code className="text-xs">/agencia/[slug]/panel</code> una vez
          conoces el identificador de la ficha.
        </p>
      </main>
    </PublicShell>
  );
}
