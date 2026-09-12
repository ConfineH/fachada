import { LegalDoc } from "@/components/legal-doc";
import { getLegal } from "@/lib/legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Normas de uso y contenidos",
  "Reglas para reseñas, respuestas de inmobiliarias, denuncias y corrección de fichas en Fachada.",
  "/legal/normas",
);

export default function NormasPage() {
  const legal = getLegal();

  return (
    <LegalDoc title="Normas de uso y contenidos" updated="septiembre 2026">
      <p>
        Al enviar una reseña, responder como inmobiliaria, denunciar contenido
        o aportar datos a una ficha aceptas estas normas. Fachada aloja
        contenidos de usuarios y aplica estas reglas de forma objetiva,
        proporcionada y con revisión humana.
      </p>
      <h2>Quién habla en cada contenido</h2>
      <ul>
        <li>
          La <strong>reseña</strong> expresa la experiencia y opinión de su
          autor, no la opinión ni el respaldo de Fachada.
        </li>
        <li>
          La <strong>respuesta</strong> expresa la posición del representante
          de la inmobiliaria que la publica.
        </li>
        <li>
          La <strong>ficha, sus cálculos y sus resúmenes</strong> son
          elaborados por Fachada a partir de datos públicos y contenidos
          publicados. Pueden corregirse mediante los canales indicados.
        </li>
      </ul>
      <h2>Autenticidad de las reseñas</h2>
      <ul>
        <li>
          Deben basarse en una experiencia propia y reciente con la
          inmobiliaria: alquiler, gestión, visita, negociación o incidencia.
        </li>
        <li>
          El autor declara la fecha de su última interacción, que no actúa por
          encargo de otra persona y que no recibió incentivos.
        </li>
        <li>
          No pueden escribir competidores, empleados, familiares o proveedores
          cuando exista un conflicto de interés no declarado.
        </li>
        <li>
          Verificar el correo confirma el control de esa cuenta; no prueba por sí
          solo que la experiencia ocurriera. Si Fachada revisa evidencia, se
          indicará expresamente como experiencia acreditada.
        </li>
      </ul>
      <h2>Contenido permitido y límites</h2>
      <ul>
        <li>
          Describe hechos que viviste y distingue claramente lo ocurrido de tu
          valoración personal.
        </li>
        <li>
          No publiques datos de terceros identificables (nombre completo del
          agente, DNI, teléfono personal, dirección privada, menores, salud,
          cuentas bancarias o documentos completos).
        </li>
        <li>No uses el archivo para insultos gratuitos, amenazas o spam.</li>
        <li>
          No imputes delitos —por ejemplo, estafa, robo o fraude— sin evidencia
          suficiente. Fachada puede pedir documentación o no publicar esa
          afirmación.
        </li>
        <li>
          No se admiten reseñas falsas, coordinadas, incentivadas, duplicadas,
          copiadas ni generadas automáticamente.
        </li>
      </ul>
      <h2>Licencia y autoría</h2>
      <p>
        Conservas la titularidad de tu contenido. Concedes a Fachada una
        licencia no exclusiva, gratuita y limitada a alojarlo, reproducirlo,
        mostrarlo, indexarlo dentro del servicio, realizar copias técnicas y
        aplicar las modificaciones mínimas necesarias para privacidad y
        moderación. La licencia dura mientras el contenido esté publicado y,
        después, durante el periodo estrictamente necesario en copias de
        seguridad o para cumplir obligaciones y defender reclamaciones.
      </p>
      <h2>Moderación</h2>
      <p>
        Las reseñas no salen en la ficha hasta que un moderador las revisa.
        Podemos no publicar, limitar o retirar textos ilegales, falsos, no
        relacionados con una experiencia real o contrarios a estas normas.
        Comunicaremos al autor la regla aplicada y el motivo. No retiramos una
        crítica por ser negativa, por petición especial ni por pago.
      </p>
      <h2>Denunciar contenido ilícito</h2>
      <p>
        Usa el enlace «Denunciar» junto a cada reseña o escribe a{" "}
        {legal.contactEmail}. Identifica la URL y el fragmento exacto, explica
        el derecho o norma vulnerados, aporta un correo de contacto y confirma
        de buena fe que la información es exacta. Acusaremos recibo y
        comunicaremos una decisión motivada. Una discrepancia o una valoración
        negativa no convierten por sí solas una reseña en ilícita.
      </p>
      <h2>Agencias</h2>
      <p>
        Reclamar una ficha no borra reseñas. Permite responder en nombre de la
        inmobiliaria y aportar evidencia. Las respuestas están sujetas a las
        mismas reglas y no pueden revelar datos de clientes o autores.
      </p>
      <h2>Corrección y rectificación</h2>
      <p>
        Para corregir un dato de ficha usa «¿Ves algo que no cuadra?». Para
        ejercer un derecho formal de rectificación sobre hechos inexactos y
        perjudiciales, escribe a {legal.contactEmail} con el contenido exacto,
        la rectificación solicitada y evidencia. Este canal no sirve para
        eliminar opiniones lícitas con las que no se esté de acuerdo.
      </p>
      <h2>Contacto DSA</h2>
      <p>
        El punto de contacto para usuarios y autoridades conforme al
        Reglamento de Servicios Digitales es {legal.contactEmail}. Atendemos en
        español y las comunicaciones no se resuelven exclusivamente de forma
        automatizada.
      </p>
    </LegalDoc>
  );
}
