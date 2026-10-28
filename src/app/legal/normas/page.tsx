import { LegalDoc } from "@/components/legal-doc";
import { MAX_EXPERIENCE_AGE_MONTHS } from "@/lib/domain/review-authenticity";
import { publicMailbox } from "@/lib/legal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Normas de uso y contenidos",
  "Reglas para reseñas, respuestas de inmobiliarias, avisos de contenido y corrección de fichas en Fachada.",
  "/legal/normas",
);

export default function NormasPage() {
  const mailbox = publicMailbox();
  const contact = mailbox ?? (
    <a href="/legal/aviso-legal">el aviso legal</a>
  );

  return (
    <LegalDoc title="Normas de uso y contenidos" updated="octubre 2026">
      <p>
        Al enviar una reseña, responder como inmobiliaria, denunciar un
        contenido o aportar datos a una ficha aceptas estas normas. Fachada
        aloja contenidos de usuarios. Un filtro automático aplica estas reglas
        antes de publicar. Las decisiones sobre avisos y textos retenidos las
        toma una persona.
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
          Deben basarse en una experiencia propia de los últimos{" "}
          {MAX_EXPERIENCE_AGE_MONTHS} meses con la inmobiliaria: alquiler,
          gestión, visita, negociación o incidencia.
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
        <li>
          Puedes editar o eliminar tu reseña desde tu cuenta. Si la editas,
          el sello de experiencia acreditada vuelve a experiencia declarada
          y queda marcada como editada. Si el texto nuevo pasa el filtro y
          el correo está verificado, se publica otra vez. Si no, deja de
          verse hasta que una persona lo revise. El rol, la inmobiliaria y
          la fecha de la experiencia no se pueden cambiar.
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
      <h2>Publicación y moderación</h2>
      <p>
        Fachada es un alojador de contenidos. Una reseña con el correo
        verificado y sin señales de riesgo se publica en la ficha al enviarla.
        El filtro automático rechaza enlaces, teléfonos, correos, documentos
        de identidad, cuentas bancarias e insultos: hay que corregirlos antes
        de enviar. Si el texto imputa un delito o identifica a una persona,
        te pedimos que lo cuentes como hecho. Si aun así lo envías, no se
        publica y lo revisa una persona.
      </p>
      <p>
        No llamamos «verificada» a una experiencia que solo está declarada.
        «Experiencia declarada» significa que el autor afirma que ocurrió.
        «Experiencia acreditada» solo aparece cuando una persona ha revisado
        pruebas privadas, como un contrato o recibos. Esas pruebas no se
        publican.
      </p>
      <p>
        Podemos no publicar, limitar u ocultar textos ilegales, falsos, ajenos
        a una experiencia real o contrarios a estas normas. Una crítica no se
        retira por ser negativa, por petición especial ni por pago. Si
        restringimos un texto, comunicamos la regla y el motivo. El autor
        puede pedir una revisión humana.
      </p>
      <h2>Denunciar un contenido</h2>
      <p>
        Usa «Denunciar» en cada reseña. Si representas a la inmobiliaria con
        la ficha verificada, también puedes «Solicitar revisión» desde su
        panel. El aviso indica un motivo: datos personales, hecho falso, no
        fue cliente, contenido ofensivo o acusación de delito, spam o reseña
        falsa, u otro. Identifica el fragmento, explica el problema, aporta
        un correo y confirma de buena fe que la información es exacta. También
        puedes escribir a {contact}.
      </p>
      <p>
        Un aviso por datos personales o por contenido ofensivo o acusación de
        delito oculta la reseña de forma provisional solo si el correo de
        quien avisa está verificado, con una sesión o con un código. Sin ese
        correo verificado el aviso queda en cola y la reseña sigue visible.
        El mismo motivo no vuelve a ocultarla mientras no se haya revisado.
        El resto de avisos no la ocultan mientras se revisan.
        Acusamos recibo y comunicamos una decisión motivada al autor y a
        quien avisó. El autor puede recurrirla. La inmobiliaria conserva el
        derecho a responder en la ficha. Una discrepancia o una valoración
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
        Para corregir un dato de ficha usa «¿Ves algo que no cuadra?»,
        incluido el logotipo. Se publica si un moderador confirma que
        corresponde a esa inmobiliaria. Para ejercer un derecho formal de
        rectificación sobre hechos inexactos y perjudiciales, escribe a{" "}
        {contact} con el contenido exacto, la rectificación solicitada y
        evidencia. Este canal no sirve para eliminar opiniones lícitas con las
        que no se esté de acuerdo.
      </p>
      <h2>Contacto DSA</h2>
      <p>
        El punto de contacto para usuarios y autoridades conforme al
        Reglamento de Servicios Digitales es {contact}. Atendemos en
        español y las comunicaciones no se resuelven exclusivamente de forma
        automatizada.
      </p>
    </LegalDoc>
  );
}
