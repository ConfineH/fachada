import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Sobre Fachada",
  description:
    "Archivo independiente de reputación de gestión inmobiliaria en España.",
};

export default function SobrePage() {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Institucional
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Sobre Fachada
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Fachada es un archivo público de cómo gestionan las inmobiliarias el
          alquiler en España: fianzas, reparaciones, trato y comunicación.
          No vendemos pisos ni anuncios.
        </p>
        <p className="mt-4 text-lg text-zinc-600">
          Quien escribe se identifica con email o Google. En la ficha no sale
          el correo.
        </p>
        <section className="mt-10 space-y-4 text-zinc-700">
          <p>
            El mercado ya tiene portales de inmuebles y reseñas genéricas de
            Google. Lo que faltaba era una lente específica: inquilino frente a
            propietario, con evidencia moderada y contexto legal reciente
            (honorarios, servicios impuestos, demoras).
          </p>
          <p>
            El archivo es independiente. Las agencias pueden reclamar su ficha
            y responder, no editar las valoraciones de terceros.
          </p>
        </section>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/explorar" className="btn-primary min-h-11 px-5">
            Explorar ciudades
          </Link>
          <Link href="/metodologia" className="btn-secondary min-h-11 px-5">
            Leer la metodología
          </Link>
        </div>
      </main>
    </PublicShell>
  );
}
