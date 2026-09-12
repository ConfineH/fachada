import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { SearchForm } from "@/components/search-form";
import { usingSupabase } from "@/lib/container";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Acceso para inmobiliarias",
  "Reclama la ficha de tu inmobiliaria, responde experiencias publicadas y completa los datos públicos. Reclamar no borra reseñas.",
  "/agencia/acceso",
);

export default function AccesoAgenciasPage() {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Portal inmobiliaria
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Reclama la ficha de tu inmobiliaria
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
            pública, identifica tu cuenta, aporta correo corporativo y
            documentación. Si la ficha tiene teléfono publicado, pedimos
            comprobar esa línea cuando el envío por SMS está activo.
          </li>
          <li>
            <strong className="text-zinc-900">3. Panel.</strong> Cuando esté
            aprobado, entra en el panel de esa agencia para responder y
            completar Idealista, Fotocasa o los nombres con los que opera.
          </li>
        </ol>

        <div className="mt-10">
          <SearchForm variant="hero" />
        </div>

        <p className="mt-8 text-sm text-zinc-600">
          ¿No está en el archivo?{" "}
          <Link href="/agregar-inmobiliaria" className="link-brand">
            Sugerir el alta
          </Link>
          . Cuando la reclamación esté aprobada, el acceso al panel aparece en
          la ficha.
        </p>
      </main>
    </PublicShell>
  );
}
