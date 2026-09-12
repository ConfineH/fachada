import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { PublicShell } from "@/components/public-shell";
import { usingSupabase } from "@/lib/container";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Cómo publicamos una reseña",
    "Cuenta identificada, experiencia declarada o acreditada, doble lente inquilino/propietario y moderación humana. Sin anonimato absoluto ni comprobación automática de los hechos.",
  "/metodologia",
);

export default function MetodologiaPage() {
  return (
    <PublicShell storage={usingSupabase() ? "supabase" : "memory"}>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Breadcrumbs
          items={[{ name: "Cómo publicamos una reseña", href: "/metodologia" }]}
        />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Archivo público
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Cómo publicamos una reseña
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          No es un muro anónimo ni un sello de «reseña verificada». Pedimos
          cuenta identificada, una experiencia propia declarada y una persona
          que lea el texto antes de publicarlo.
        </p>

        <section className="mt-10 space-y-8 text-zinc-700">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              1. Cuenta identificada
            </h2>
            <p className="mt-2">
              Para dejar una reseña hay que confirmar un correo (código o
              Google). En la ficha pública no lo mostramos: aparece un
              seudónimo o un identificador neutro. El correo queda en nuestros
              registros para moderación y para limitar abusos. Eso demuestra el
              control de la cuenta, no que la experiencia ocurriera. No
              prometemos anonimato absoluto.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              2. Experiencia declarada o acreditada
            </h2>
            <p className="mt-2">
              El autor indica cuándo y cómo trató con la inmobiliaria y declara
              que fue una experiencia propia, sin incentivo ni conflicto de
              interés. «Experiencia declarada» significa eso. Solo usamos
              «experiencia acreditada» cuando Fachada ha revisado evidencia
              suficiente; esa evidencia nunca se publica.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              3. Doble lente
            </h2>
            <p className="mt-2">
              Cada reseña declara si quien escribe es inquilino o propietario.
              Las medias se calculan por separado porque el servicio no es el
              mismo.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              4. Incidencias etiquetadas
            </h2>
            <p className="mt-2">
              Además del texto libre, se pueden marcar temas recurrentes:
              honorarios, seguros impuestos, fianza, reparaciones, comunicación
              o renovación. Sirven para comparar patrones, no para litigar.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              5. Moderación humana
            </h2>
            <p className="mt-2">
              Una reseña no sale en la ficha hasta que un moderador la aprueba.
              Retiramos contenido ilegal, fuera de experiencia real o que
              identifique a terceros de forma innecesaria. Una crítica no se
              retira por ser negativa. Las decisiones de restricción se
              comunican con su motivo y pueden revisarse.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              6. Fichas de agencia
            </h2>
            <p className="mt-2">
              Las altas las revisamos antes de publicar. Un representante puede
              reclamar la ficha, responder reseñas y completar enlaces a
              Idealista, Fotocasa o la web. Eso no borra valoraciones de
              inquilinos o propietarios.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              7. Qué pertenece a Fachada
            </h2>
            <p className="mt-2">
              La reseña pertenece a su autor y la respuesta a la inmobiliaria.
              La estructura de la ficha, el cálculo de medias y los resúmenes
              son elaborados por Fachada. Siempre mostramos la muestra y
              ofrecemos un canal de corrección o denuncia.
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
