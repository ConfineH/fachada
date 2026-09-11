import { LegalDoc } from "@/components/legal-doc";
import { getLegal } from "@/lib/legal";

export const metadata = {
  title: "Normas de uso — Fachada",
};

export default function NormasPage() {
  const legal = getLegal();

  return (
    <LegalDoc title="Normas de uso y contenidos" updated="septiembre 2026">
      <p>
        Al enviar una reseña o reclamar una ficha aceptas estas normas. Fachada
        aloja contenidos de usuarios (texto de opiniones) y puede retirarlos.
      </p>
      <h2>Reseñas</h2>
      <ul>
        <li>Deben basarse en una experiencia real de alquiler o gestión.</li>
        <li>
          No publiques datos de terceros identificables (nombre completo del
          agente, DNI, teléfono personal, menores, salud).
        </li>
        <li>No uses el archivo para insultos gratuitos, amenazas o spam.</li>
        <li>
          Ventajas y desventajas son obligatorias: describe hechos, no solo un
          adjetivo.
        </li>
        <li>
          El correo no se publica. Si pones un nombre público, es opcional y
          visible.
        </li>
      </ul>
      <h2>Moderación</h2>
      <p>
        Las reseñas no salen en la ficha hasta que un moderador las revisa.
        Podemos no publicar o retirar textos ilegales, no relacionados con la
        gestión, o que expongan datos ajenos.
      </p>
      <h2>Aviso de contenido ilícito</h2>
      <p>
        Si ves una reseña ilegal (difamación, datos de un tercero, etc.),
        escribe a {legal.contactEmail} indicando URL de la ficha, fecha
        aproximada y por qué es ilícita. Lo revisaremos.
      </p>
      <h2>Agencias</h2>
      <p>
        Reclamar una ficha no borra reseñas. Permite responder en nombre de la
        inmobiliaria. Las respuestas también pueden moderarse.
      </p>
    </LegalDoc>
  );
}
