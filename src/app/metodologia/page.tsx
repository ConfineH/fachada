import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Metodología de verificación — Fachada",
  description:
    "Cómo Fachada publica reseñas de inmobiliarias: SMS, rol, moderación y taxonomía de incidencias.",
};

export default function MetodologiaPage() {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Archivo público
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Metodología de verificación
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Fachada no es un muro de opiniones anónimas. Publicamos experiencias
          de gestión inmobiliaria cuando hay una señal de identidad y un
          criterio editorial.
        </p>

        <section className="mt-10 space-y-8 text-zinc-700">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              1. Teléfono verificado
            </h2>
            <p className="mt-2">
              Para dejar una reseña hay que confirmar un móvil español con un
              código SMS. En la ficha pública no mostramos el número: aparece
              un seudónimo o un identificador neutro. El teléfono queda en
              backend para moderación y límites de abuso.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              2. Doble lente
            </h2>
            <p className="mt-2">
              Cada reseña declara si quien escribe es inquilino o propietario.
              Las medias se calculan por separado porque el servicio no es el
              mismo.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              3. Incidencias etiquetadas
            </h2>
            <p className="mt-2">
              Además del texto libre, se pueden marcar temas recurrentes:
              honorarios, seguros impuestos, fianza, reparaciones, comunicación
              o renovación. Sirven para comparar patrones, no para litigar.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              4. Moderación humana
            </h2>
            <p className="mt-2">
              Una reseña no sale en la ficha hasta que un moderador la aprueba.
              Retiramos contenido ilegal, fuera de experiencia real o que
              identifique a terceros de forma innecesaria.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              5. Fichas de agencia
            </h2>
            <p className="mt-2">
              Las altas las revisamos antes de publicar. Un representante puede
              reclamar la ficha, responder reseñas y completar enlaces a
              Idealista, Fotocasa o la web. Eso no borra valoraciones de
              inquilinos o propietarios.
            </p>
          </div>
        </section>

        <p className="mt-10 text-sm text-zinc-600">
          Fachada no gestiona reclamaciones económicas. Para eso están
          asociaciones de consumidores. Nosotros archivamos reputación de
          gestión.
        </p>
        <p className="mt-6">
          <Link href="/sobre" className="link-brand text-sm">
            Sobre Fachada
          </Link>
          {" · "}
          <Link href="/legal/aviso-legal" className="link-brand text-sm">
            Aviso legal
          </Link>
        </p>
      </main>
    </PublicShell>
  );
}
