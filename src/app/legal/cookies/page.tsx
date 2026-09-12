import { LegalDoc } from "@/components/legal-doc";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Política de cookies",
  "Cookies y almacenamiento local que usa Fachada: sesión, preferencias y acceso de administración.",
  "/legal/cookies",
);

export default function CookiesPage() {
  return (
    <LegalDoc title="Información sobre cookies y almacenamiento local" updated="septiembre 2026">
      <p>
        Esta página cumple el artículo 22.2 LSSI (almacenar o acceder a datos
        en tu dispositivo). No usamos cookies de publicidad ni de analítica.
      </p>
      <h2>Qué hay hoy</h2>
      <ul>
        <li>
          <strong>Navegación pública:</strong> no instalamos cookies propias.
          Puedes leer fichas sin identificarte.
        </li>
        <li>
          <strong>Al iniciar sesión:</strong> guardamos un token de sesión en{" "}
          <code>sessionStorage</code> (<code>fachada.sessionToken</code>). Se
          borra al cerrar la pestaña. Es necesario para el servicio que pides
          (cuenta, reseña, guardar ficha).
        </li>
        <li>
          <strong>Google:</strong> el script de Google Identity Services solo
          se carga si pulsas «Continuar con Google». Entonces Google puede
          usar cookies propias en sus dominios. Es el medio de identificación
          que has elegido.
        </li>
        <li>
          <strong>Panel /admin:</strong> cookie httpOnly <code>fachada_admin</code>
          , 8 horas, solo si entras al panel de moderación. No forma parte del
          servicio público.
        </li>
      </ul>
      <h2>¿Hace falta un banner de «aceptar cookies»?</h2>
      <p>
        Con el diseño actual, no: no hay trazadores no necesarios en la visita
        anónima. Si más adelante añadimos analítica, publicidad o un login
        automático (One Tap), habría que pedir consentimiento previo, con
        opción de rechazar, según la guía de cookies de la AEPD.
      </p>
      <h2>Cómo borrarlos</h2>
      <p>
        Cierra la pestaña o usa «Cerrar sesión» en /cuenta. Para la cookie de
        admin, cierra sesión en /admin o borra cookies de este dominio. Las
        cookies de Google se gestionan en tu cuenta de Google y en el
        navegador.
      </p>
    </LegalDoc>
  );
}
