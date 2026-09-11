import { LegalDoc } from "@/components/legal-doc";
import { getLegal, isLegalIdentityComplete } from "@/lib/legal";

export const metadata = {
  title: "Aviso legal — Fachada",
};

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
      <h2>Propiedad intelectual</h2>
      <p>
        El diseño, las marcas y el software de Fachada pertenecen al titular.
        Las reseñas siguen siendo responsabilidad de quien las envía; Fachada
        las aloja y puede moderarlas o retirarlas.
      </p>
      <h2>Exclusión de responsabilidad</h2>
      <p>
        Las reseñas reflejan experiencias individuales, no un dictamen
        profesional ni una calificación oficial. Los enlaces a Idealista,
        Fotocasa u otros sitios son de terceros. Fachada no responde de su
        contenido ni de la disponibilidad del servicio más allá de la diligencia
        razonable.
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
