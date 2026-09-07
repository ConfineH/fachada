import Link from "next/link";

import { DevBanner } from "@/components/dev-banner";
import { SiteNav } from "@/components/site-nav";
import { usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Aviso legal — Fachada",
};

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <DevBanner storage={usingSupabase() ? "supabase" : "memory"} />
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-10 prose prose-stone">
        <h1>Aviso legal</h1>
        <p className="text-sm text-stone-500">Última actualización: agosto 2026</p>
        <p>
          Fachada es un directorio de opiniones sobre gestión inmobiliaria en
          España. El titular del sitio es responsable del contenido editorial y
          de la moderación de reseñas.
        </p>
        <h2>Uso del servicio</h2>
        <p>
          Las reseñas deben basarse en experiencias reales. Nos reservamos el
          derecho de retirar contenido que incumpla las normas de la comunidad.
        </p>
        <h2>Enlaces externos</h2>
        <p>
          Los enlaces a portales inmobiliarios o webs de terceros no implican
          afiliación ni responsabilidad sobre sus contenidos.
        </p>
        <p>
          <Link href="/legal/privacidad">Política de privacidad</Link>
        </p>
        <p>
          <Link href="/">Volver al inicio</Link>
        </p>
      </main>
    </div>
  );
}
