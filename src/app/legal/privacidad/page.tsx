import { LegalDoc } from "@/components/legal-doc";
import { getLegal, isLegalIdentityComplete } from "@/lib/legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Política de privacidad",
  "Qué datos trata Fachada, con qué base, cuánto tiempo y cómo ejercer tus derechos.",
  "/legal/privacidad",
);

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
          <strong>Cuenta:</strong> correo (Google o código), identificador
          interno, fecha de alta. El correo no se publica en las fichas.
        </li>
        <li>
          <strong>Reseñas:</strong> rol (inquilino/propietario), nota, título,
          ventajas y desventajas, fecha y tipo de experiencia, declaraciones
          de autenticidad, etiquetas de incidencia, si recomendarías, nombre
          público opcional, nivel de acreditación y votos de «útil».
        </li>
        <li>
          <strong>Evidencia:</strong> documentos o capturas que decidas aportar
          para acreditar una experiencia, representación o corrección. No se
          publican y te pedimos que ocultes datos ajenos e innecesarios.
        </li>
        <li>
          <strong>Denuncias y rectificaciones:</strong> identidad y contacto
          del solicitante, contenido afectado, fundamento, evidencia,
          comunicaciones y decisión.
        </li>
        <li>
          <strong>Agencias guardadas</strong> si usas la cuenta.
        </li>
        <li>
          <strong>Reclamación de ficha:</strong> nombre, correo, teléfono de
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
          Identificarte, moderar y evitar abusos: interés legítimo (art. 6.1.f)
          en un archivo íntegro; el correo queda en nuestros registros.
        </li>
        <li>
          Alojar y publicar la reseña que solicitas: ejecución del servicio
          (art. 6.1.b), junto con el interés legítimo y las libertades de
          expresión e información para moderarla y mantenerla accesible.
        </li>
        <li>
          Tramitar avisos de contenido ilícito y órdenes: obligación legal
          (art. 6.1.c) e interés legítimo en conservar un expediente mínimo.
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
          «Continuar con Google». Reciben el hecho del acceso y el correo que
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
        La cuenta se conserva mientras la uses. Las reseñas se conservan
        mientras estén publicadas; si pides supresión u oposición, evaluaremos
        tu solicitud y los derechos de información y expresión caso por caso.
        No asumimos que seudonimizar permita conservarlas automáticamente. Los
        códigos de un solo uso y las sesiones se eliminan al verificarse,
        caducar o cerrarse. Las evidencias y expedientes se conservan solo
        durante la revisión y el
        periodo necesario para atender o defender reclamaciones; los plazos
        concretos se documentan internamente y se revisan periódicamente.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Acceso, rectificación, supresión, oposición, limitación y portabilidad:
        escribe a {legal.privacyEmail}. Acusaremos recibo, verificaremos tu
        identidad de forma proporcionada y responderemos normalmente en un
        mes. También puedes reclamar ante la{" "}
        <a href="https://www.aepd.es">AEPD</a>.
      </p>

      <h2>Seguridad y brechas</h2>
      <p>
        Restringimos el acceso administrativo, mantenemos las evidencias
        separadas del contenido público y registramos incidentes. Si una
        brecha supone riesgo para tus derechos, la notificaremos a la AEPD
        dentro del plazo legal y, cuando el riesgo sea alto, también a las
        personas afectadas.
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
