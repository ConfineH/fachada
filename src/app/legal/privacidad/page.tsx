import { LegalDoc } from "@/components/legal-doc";
import { getLegal, isLegalIdentityComplete } from "@/lib/legal";

export const metadata = {
  title: "Política de privacidad — Fachada",
};

export default function PrivacidadPage() {
  const legal = getLegal();

  return (
    <LegalDoc title="Política de privacidad" updated="septiembre 2026">
      <p>
        El responsable del tratamiento es el titular identificado en el{" "}
        <a href="/legal/aviso-legal">aviso legal</a> ({legal.holderName},{" "}
        {legal.privacyEmail}). Esta política cubre el sitio web y la extensión
        de navegador «Fachada — reseñas en Idealista».
      </p>
      {isLegalIdentityComplete() ? null : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Completa <code>LEGAL_CONTACT_EMAIL</code> (y el resto de{" "}
          <code>LEGAL_*</code>) en Vercel. Hasta que sea un buzón real, los
          derechos ARCO+ no se pueden ejercer de forma efectiva.
        </p>
      )}

      <h2>Qué datos tratamos</h2>
      <ul>
        <li>
          <strong>Cuenta:</strong> email (Google o código), identificador
          interno, fecha de alta. El correo no se publica en las fichas.
        </li>
        <li>
          <strong>Reseñas:</strong> rol (inquilino/propietario), nota, título,
          ventajas y desventajas, etiquetas de incidencia, si recomendarías,
          nombre público opcional, votos de «útil».
        </li>
        <li>
          <strong>Agencias guardadas</strong> si usas la cuenta.
        </li>
        <li>
          <strong>Reclamación de ficha:</strong> nombre, email, teléfono de
          contacto, CIF si aplica, documentación que subas.
        </li>
        <li>
          <strong>Línea de negocio:</strong> teléfono de la ficha, solo para
          contrastar que representas a la agencia (cuando ese flujo esté
          activo).
        </li>
        <li>
          <strong>Admin:</strong> cookie de sesión en <code>/admin</code>, no
          en la navegación pública.
        </li>
      </ul>
      <p>
        No pedimos categorías especiales del artículo 9 RGPD (salud, ideología,
        etc.). No las incluyas en la reseña: si aparecen, podemos retirar el
        texto.
      </p>

      <h2>Para qué y con qué base</h2>
      <ul>
        <li>
          Prestar el servicio (cuenta, publicar o guardar, reclamar ficha):
          ejecución de contrato o medidas precontractuales (art. 6.1.b RGPD).
        </li>
        <li>
          Identificarte para moderar y evitar abusos: interés legítimo (art.
          6.1.f) en un archivo de reputación íntegro; el correo queda en
          backend.
        </li>
        <li>
          Publicar reseñas moderadas: interés legítimo y, al enviar, tu
          decisión de participar.
        </li>
        <li>
          Obligaciones legales (requerimientos, conservación mínima).
        </li>
      </ul>

      <h2>Encargados y terceros</h2>
      <ul>
        <li>Alojamiento y despliegue: Vercel.</li>
        <li>Base de datos: Supabase (proyecto propio de Fachada).</li>
        <li>
          Inicio de sesión con Google: Google Ireland Limited, solo si pulsas
          «Continuar con Google». Reciben el hecho del login y el email que
          Google nos confirma.
        </li>
        <li>
          Email transaccional (Resend), solo si está configurado: envío del
          código.
        </li>
      </ul>
      <p>
        El servidor de Fachada está en la UE (Vercel/Supabase según región
        contratada). Google puede tratar datos en EE. UU. bajo sus cláusulas
        contractuales y el marco de transferencia que publique en cada momento.
      </p>

      <h2>Conservación</h2>
      <p>
        La cuenta y las reseñas se conservan mientras el archivo esté activo y
        no pidas supresión, salvo que debamos bloquear una cuenta por abuso o
        guardar un mínimo por reclamación legal. Las reseñas publicadas pueden
        permanecer seudonimizadas (rol, sin email) si retirarlas vacía una
        ficha de forma desproporcionada; en ese caso te lo diremos.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Acceso, rectificación, supresión, oposición, limitación y portabilidad:
        escribe a {legal.privacyEmail}. También puedes reclamar ante la{" "}
        <a href="https://www.aepd.es">AEPD</a>.
      </p>

      <h2>Extensión de navegador</h2>
      <p>
        La extensión solo se ejecuta en páginas de Idealista. Lee el nombre de
        la inmobiliaria visible en el anuncio, lo envía a Fachada (
        <code>/api/agencies/match</code>) y muestra un badge con el enlace a la
        ficha. No lee tu cuenta de Idealista, no modifica envíos de formularios
        y no guarda el historial de navegación en nuestros servidores más allá
        de la consulta de coincidencia (el nombre buscado, de forma transitoria
        en logs técnicos).
      </p>
      <p>
        Hasta publicarla en Chrome Web Store puedes cargarla descomprimida; el
        tratamiento es el mismo.
      </p>
    </LegalDoc>
  );
}
