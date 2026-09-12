import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PublicShell } from "@/components/public-shell";
import { usingSupabase } from "@/lib/container";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Sobre Fachada",
  "Por qué existe Fachada: un archivo independiente de la gestión de inmobiliarias, no un portal de pisos ni un muro de Google.",
  "/sobre",
);

export default function SobrePage() {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Breadcrumbs items={[{ name: "Sobre Fachada", href: "/sobre" }]} />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Institucional
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Sobre Fachada
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Fachada archiva cómo gestionan las inmobiliarias el alquiler en
          España: fianzas, reparaciones, honorarios y comunicación. No vendemos
          pisos ni anuncios.
        </p>
        <p className="mt-4 text-lg text-zinc-600">
          Quien escribe confirma un correo o entra con Google. En la ficha no
          sale esa dirección. Eso identifica la cuenta, no demuestra por sí
          solo que la experiencia ocurriera.
        </p>
        <section className="mt-10 space-y-4 text-zinc-700">
          <p>
            Idealista enseña el piso. Google mezcla visitas a oficina, ventas y
            azar. Faltaba la lente de gestión: inquilino frente a propietario,
            con incidencias etiquetadas (honorarios, fianza, reparaciones).
          </p>
          <p>
            El archivo es independiente. Una inmobiliaria puede reclamar su
            ficha y responder. No puede editar ni borrar una crítica lícita.
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
