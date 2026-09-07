import Link from "next/link";

import { DevBanner } from "@/components/dev-banner";
import { SiteNav } from "@/components/site-nav";
import { usingSupabase } from "@/lib/container";

export const metadata = {
  title: "Política de privacidad — Fachada",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <DevBanner storage={usingSupabase() ? "supabase" : "memory"} />
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-10 prose prose-stone">
        <h1>Política de privacidad</h1>
        <p className="text-sm text-stone-500">Última actualización: septiembre 2026</p>
        <p>
          Fachada trata datos personales para identificar cuentas (email o
          Google), publicar reseñas y gestionar reclamaciones de inmobiliarias.
        </p>
        <h2>Datos que recogemos</h2>
        <ul>
          <li>Email (código de verificación o inicio de sesión con Google)</li>
          <li>Teléfono, solo si se usa para contrastar la línea de una agencia</li>
          <li>Contenido de reseñas y reclamaciones</li>
          <li>Datos de contacto en solicitudes de reclamo</li>
        </ul>
        <h2>Base legal</h2>
        <p>
          Interés legítimo en ofrecer un servicio de reputación y consentimiento
          al enviar reseñas o solicitudes.
        </p>
        <h2>Conservación</h2>
        <p>
          Conservamos los datos mientras sea necesario para el servicio y las
          obligaciones legales aplicables.
        </p>
        <h2>Contacto</h2>
        <p>
          Para ejercer derechos ARCO-POL, escribe a{" "}
          <a href="mailto:privacidad@fachada.app">privacidad@fachada.app</a>.
        </p>
        <p>
          <Link href="/">Volver al inicio</Link>
        </p>
      </main>
    </div>
  );
}
