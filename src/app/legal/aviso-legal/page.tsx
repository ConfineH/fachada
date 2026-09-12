import { LegalDoc } from "@/components/legal-doc";
import { getLegal, isLegalIdentityComplete } from "@/lib/legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Aviso legal",
  "Identificación del prestador, objeto del archivo y punto de contacto de Fachada.",
  "/legal/aviso-legal",
);

export default function AvisoLegalPage() {
  const legal = getLegal();

  return (
    <LegalDoc title="Aviso legal" updated="septiembre 2026">
      <p>
        Este aviso identifica al prestador del servicio de la sociedad de la
        información <strong>{legal.serviceName}</strong>, accesible en{" "}
        {legal.siteUrl}, de conformidad con el artículo 10 de la Ley 34/2002
        (LSSI).
      </p>
      {isLegalIdentityComplete() ? null : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Borrador: falta titular real. En Vercel, rellena{" "}
          <code>LEGAL_HOLDER_NAME</code>, <code>LEGAL_HOLDER_ID</code>,{" "}
          <code>LEGAL_HOLDER_ADDRESS</code> y <code>LEGAL_CONTACT_EMAIL</code>.
        </p>
      )}
      <h2>Titular</h2>
      <ul>
        <li>Nombre o denominación: {legal.holderName}</li>
        <li>NIF / NIE / CIF: {legal.holderId}</li>
        <li>Domicilio: {legal.holderAddress}</li>
        <li>Email: {legal.contactEmail}</li>
      </ul>
      <h2>Objeto</h2>
      <p>
        Fachada es un archivo público de opiniones sobre la gestión de
        inmobiliarias en España (inquilinos y propietarios). No es un portal de
        anuncios, no intermedia contratos y no presta servicios de agencia.
      </p>
      <p>
        Las reseñas son contenidos aportados por sus autores y expresan su
        experiencia y opinión. No representan la opinión ni el respaldo de
        Fachada. Las respuestas pertenecen a las inmobiliarias que las
        publican. Las fichas, cálculos y resúmenes sí son elaborados por
        Fachada y pueden corregirse mediante los canales de las normas de uso.
      </p>
      <h2>Contacto y contenidos ilícitos</h2>
      <p>
        El punto de contacto para usuarios y autoridades, incluidas
        comunicaciones del Reglamento de Servicios Digitales, es{" "}
        {legal.contactEmail}. Atendemos en español. Para denunciar una reseña,
        usa el enlace junto a ella o identifica su URL, el fragmento concreto y
        el motivo jurídico en un correo. Consulta las{" "}
        <a href="/legal/normas">normas de uso y contenidos</a>.
      </p>
      <h2>Propiedad intelectual</h2>
      <p>
        El diseño, las marcas y el software de Fachada pertenecen al titular.
        Las reseñas siguen siendo responsabilidad de quien las envía; Fachada
        las aloja y puede moderarlas o retirarlas.
      </p>
      <h2>Exclusión de responsabilidad</h2>
      <p>
        Las reseñas reflejan experiencias individuales, no un dictamen
        profesional ni una calificación oficial. Fachada no garantiza que una
        cuenta identificada pruebe por sí sola la experiencia descrita. Actúa
        con diligencia ante avisos suficientemente precisos y mantiene un
        proceso de moderación y respuesta. Los enlaces a Idealista, Fotocasa u
        otros sitios son de terceros y no implican afiliación.
      </p>
      <h2>Legislación y fuero</h2>
      <p>
        Este sitio se dirige a usuarios en España. Salvo norma imperativa en
        contrario, se aplica la legislación española y los juzgados del
        domicilio del titular.
      </p>
    </LegalDoc>
  );
}
