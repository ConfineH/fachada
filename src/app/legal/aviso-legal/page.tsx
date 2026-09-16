import { LegalDoc } from "@/components/legal-doc";
import { getLegal, hasPublicContact, hasRegisteredHolder } from "@/lib/legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Aviso legal",
  "Punto de contacto de Fachada y objeto del archivo.",
  "/legal/aviso-legal",
);

export default function AvisoLegalPage() {
  const legal = getLegal();
  const registered = hasRegisteredHolder();

  return (
    <LegalDoc title="Aviso legal" updated="septiembre 2026">
      <p>
        <strong>{legal.serviceName}</strong> es un archivo público de
        reputación de inmobiliarias, accesible en {legal.siteUrl}.
      </p>
      <h2>Contacto</h2>
      {hasPublicContact() ? (
        <p>
          El punto de contacto para usuarios y autoridades es{" "}
          {legal.contactEmail}. Atendemos en español.
        </p>
      ) : (
        <p>
          Publicaremos aquí un correo de contacto. Atendemos en español.
        </p>
      )}
      {registered ? (
        <>
          <h2>Titular</h2>
          <ul>
            <li>Nombre o denominación: {legal.holderName}</li>
            <li>NIF / NIE / CIF: {legal.holderId}</li>
            <li>Domicilio: {legal.holderAddress}</li>
            <li>Correo: {legal.contactEmail}</li>
          </ul>
        </>
      ) : (
        <p>
          En esta fase no publicamos nombre, NIF ni domicilio. Cuando se
          constituya la sociedad, este aviso incluirá denominación, NIF y
          domicilio social.
        </p>
      )}
      <h2>Objeto</h2>
      <p>
        Fachada archiva opiniones y valoraciones sobre la gestión de
        inmobiliarias en España (inquilinos y propietarios). No intermedia
        contratos ni presta servicios de agencia.
      </p>
      <p>
        Las reseñas son contenidos aportados por sus autores y expresan su
        experiencia y opinión. No representan la opinión ni el respaldo de
        Fachada. Las respuestas pertenecen a las inmobiliarias que las
        publican. Las fichas, cálculos y resúmenes sí son elaborados por
        Fachada y pueden corregirse mediante los canales de las normas de uso.
      </p>
      <h2>Contenidos ilícitos</h2>
      <p>
        Para denunciar una reseña, usa el enlace junto a ella o identifica su
        URL, el fragmento concreto y el motivo jurídico en un correo. Consulta
        las{" "}
        <a href="/legal/normas">normas de uso y contenidos</a>.
      </p>
      <h2>Propiedad intelectual</h2>
      <p>
        El diseño, las marcas y el software de Fachada pertenecen a quien
        opera el archivo. Las reseñas siguen siendo responsabilidad de quien
        las envía; Fachada las aloja y puede moderarlas o retirarlas.
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
        contrario, se aplica la legislación española y{" "}
        {registered
          ? "los juzgados del domicilio del titular."
          : "los juzgados competentes en España."}
      </p>
    </LegalDoc>
  );
}
