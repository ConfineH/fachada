import {
  BOE_ART,
  BOE_LEY_12_2023,
  BOE_RDL_29_2026,
} from "@/lib/domain/tools/constants";

export type ToolFaq = { question: string; answer: string };

export type ToolDefinition = {
  id: "honorarios" | "fianza" | "reparaciones" | "salida-anticipada";
  path: string;
  label: string;
  title: string;
  description: string;
  card: string;
  articleLabel: string;
  articleUrl: string;
  articleNote: string;
  extraLinks: Array<{ href: string; label: string }>;
  faqs: ToolFaq[];
};

export const TENANT_TOOLS: ToolDefinition[] = [
  {
    id: "honorarios",
    path: "/herramientas/honorarios",
    label: "Honorarios de agencia",
    title: "¿Te cobró honorarios la inmobiliaria?",
    description:
      "Orientación sobre si los honorarios, la gestión o el estudio de solvencia que te cobró la inmobiliaria pueden reclamarse según el artículo 20 de la LAU.",
    card: "Si te cobraron gestión, honorarios o un estudio de solvencia al firmar el alquiler.",
    articleLabel: "Artículo 20 de la LAU",
    articleUrl: BOE_ART.fees,
    articleNote:
      "Desde el 26 de mayo de 2023 (Ley 12/2023) los gastos de gestión inmobiliaria y de formalización corren a cargo del arrendador. Desde el 8 de octubre de 2026, el apartado 2 prohíbe repercutirlos al arrendatario, directa o indirectamente, bajo cualquier nombre.",
    extraLinks: [
      { href: BOE_LEY_12_2023, label: "Ley 12/2023" },
      { href: BOE_RDL_29_2026, label: "Real Decreto-ley 29/2026" },
    ],
    faqs: [
      {
        question: "¿Desde cuándo no pueden cobrarme los honorarios de la agencia?",
        answer:
          "Desde el 26 de mayo de 2023, en los arrendamientos de vivienda habitual, los gastos de gestión inmobiliaria y de formalización del contrato corren a cargo del arrendador. El 8 de octubre de 2026 el artículo 20.2 reforzó esa regla: no pueden repercutirse al inquilino, ni directa ni indirectamente, bajo ningún concepto.",
      },
      {
        question: "¿Vale para un alquiler de temporada o de habitación?",
        answer:
          "No se puede afirmar. El artículo 20 está en el título de vivienda. Un temporada puede ser un uso distinto o, si es reciente y cumple los requisitos, una vivienda temporal. La habitación a menudo queda fuera de la LAU. La herramienta marca esos casos como dudosos.",
      },
      {
        question: "¿Y si firmé antes del 26 de mayo de 2023?",
        answer:
          "También es un caso dudoso. La reforma no se aplica, en general, a los contratos ya firmados. Habría que leer qué se pactó entonces.",
      },
      {
        question: "¿Qué puedo hacer si me los cobraron?",
        answer:
          "Si el caso encaja, la herramienta indica el importe y el orden habitual: escrito a quien cobró, hoja de reclamaciones, OMIC o consumo autonómico y, si no supera los 2.000 euros, juicio verbal sin abogado ni procurador. No sustituye una consulta.",
      },
    ],
  },
  {
    id: "fianza",
    path: "/herramientas/fianza",
    label: "Reclamar la fianza",
    title: "Carta para reclamar la fianza del alquiler",
    description:
      "Genera en tu navegador una carta y un texto de burofax para reclamar la fianza. El artículo 36 de la LAU da un mes desde la entrega de llaves. Los datos no se envían ni se guardan.",
    card: "Prepara la carta y el texto del burofax cuando no te devuelven la fianza.",
    articleLabel: "Artículo 36 de la LAU",
    articleUrl: BOE_ART.deposit,
    articleNote:
      "El saldo de la fianza debe devolverse en el mes siguiente a la entrega de las llaves. Si no se hace, devenga el interés legal del dinero. Desde el 8 de octubre de 2026, si no hay un documento de finalización que anote desperfectos, se presume que la vivienda se entregó en buen estado.",
    extraLinks: [{ href: BOE_RDL_29_2026, label: "Real Decreto-ley 29/2026" }],
    faqs: [
      {
        question: "¿Cuándo tienen que devolver la fianza?",
        answer:
          "En el mes siguiente a la entrega de las llaves. La herramienta cuenta ese plazo de fecha a fecha. Si el mes siguiente no tiene ese día, usa el último día del mes.",
      },
      {
        question: "¿Qué pasa si tardan más de un mes?",
        answer:
          "El artículo 36.4 dice que, transcurrido ese mes sin devolución, el saldo devenga el interés legal del dinero. La carta lo recuerda. No calcula los euros de interés, porque el tipo cambia.",
      },
      {
        question: "¿Los datos de la carta se envían a Fachada?",
        answer:
          "No. Los nombres, la dirección y los importes se quedan en tu navegador. No hay envío ni almacenamiento. Puedes imprimir la carta o guardarla como PDF desde el propio navegador.",
      },
      {
        question: "¿Las garantías adicionales también se reclaman?",
        answer:
          "La carta puede incluirlas junto a la fianza. Esta herramienta no comprueba si el importe pactado superaba el límite legal; solo prepara la reclamación de lo que entregaste.",
      },
    ],
  },
  {
    id: "reparaciones",
    path: "/herramientas/reparaciones",
    label: "¿Quién paga la reparación?",
    title: "¿Quién paga esta reparación del alquiler?",
    description:
      "Orientación sobre caldera, electrodomésticos, humedades, persianas, cerraduras, grifos y pintura según el artículo 21 de la LAU. Si el caso es dudoso, lo dice.",
    card: "Caldera, humedades, persianas, grifos y otros desperfectos frecuentes.",
    articleLabel: "Artículo 21 de la LAU",
    articleUrl: BOE_ART.repairs,
    articleNote:
      "El arrendador paga las reparaciones necesarias para la habitabilidad, salvo que el daño lo haya causado el inquilino. El inquilino paga las pequeñas reparaciones por el desgaste del uso ordinario. Desde el 8 de octubre de 2026, el apartado 5 fija un requerimiento escrito y quince días naturales, y el artículo 21 bis trata la vivienda temporal.",
    extraLinks: [{ href: BOE_RDL_29_2026, label: "Real Decreto-ley 29/2026" }],
    faqs: [
      {
        question: "¿Qué reparaciones paga el arrendador?",
        answer:
          "Las necesarias para conservar la vivienda en condiciones de habitabilidad y para el uso pactado: por ejemplo una caldera que no da agua caliente, una filtración o una cerradura que no asegura la casa, si no las causó el inquilino.",
      },
      {
        question: "¿Qué pago yo como inquilino?",
        answer:
          "Las pequeñas reparaciones del desgaste ordinario, como un grifo que gotea, la cinta de una persiana o la pintura gastada. También el daño que hayas causado tú.",
      },
      {
        question: "¿Y si no sé quién causó el daño?",
        answer:
          "La herramienta lo marca como caso dudoso. El artículo 21 cambia de responsable según la causa, y inventar una respuesta sería peor que decir que no se sabe.",
      },
      {
        question: "¿Cómo se lo digo al arrendador?",
        answer:
          "Hay una plantilla de mensaje. En las reparaciones que le corresponden, el artículo 21.3 pide avisar pronto y dejarle ver la vivienda. Desde el 8 de octubre de 2026, el artículo 21.5 permite un requerimiento con presupuesto y un plazo de quince días naturales.",
      },
    ],
  },
  {
    id: "salida-anticipada",
    path: "/herramientas/salida-anticipada",
    label: "Salir antes del contrato",
    title: "Salir del alquiler antes de tiempo",
    description:
      "Calcula si puedes dejar un alquiler de vivienda tras seis meses, con treinta días de preaviso, y qué pasa con la indemnización del artículo 11 de la LAU.",
    card: "Seis meses, treinta días de preaviso y el tope de indemnización si estaba pactada.",
    articleLabel: "Artículo 11 de la LAU",
    articleUrl: BOE_ART.earlyExit,
    articleNote:
      "En vivienda habitual puedes desistir cuando han pasado al menos seis meses, avisando con treinta días. Hasta el 8 de octubre de 2026 se podía pactar como máximo una mensualidad por cada año que faltara, en proporción. Desde esa fecha, el artículo 11.3 dice que este desistimiento no genera indemnización.",
    extraLinks: [{ href: BOE_RDL_29_2026, label: "Real Decreto-ley 29/2026" }],
    faqs: [
      {
        question: "¿Cuándo puedo irme del piso?",
        answer:
          "En un arrendamiento de vivienda habitual, el artículo 11.1 permite desistir una vez pasados al menos seis meses desde el inicio, comunicándolo con una antelación mínima de treinta días.",
      },
      {
        question: "¿Cuánto preaviso hay que dar?",
        answer:
          "Treinta días. La herramienta calcula la fecha tope del aviso para la salida que indicas, o para la primera fecha legal si todavía no han pasado los seis meses.",
      },
      {
        question: "¿Cuánto es la indemnización máxima?",
        answer:
          "Si el contrato es anterior al 8 de octubre de 2026 y pactaba indemnización, el tope antiguo es una mensualidad de renta por cada año que falte, y la parte proporcional si falta menos de un año. El artículo 11.3, en vigor desde esa fecha, dice que el desistimiento no genera indemnización. En un contrato anterior la herramienta muestra el tope antiguo y lo marca como dudoso.",
      },
      {
        question: "¿Sirve para temporada o habitación?",
        answer:
          "No da una respuesta cerrada. El artículo 11.1 es de vivienda habitual. La temporada y la habitación pueden estar fuera de esa regla o, si son recientes, en el régimen de vivienda temporal, con otro plazo.",
      },
    ],
  },
];

export function toolById(id: ToolDefinition["id"]): ToolDefinition {
  const tool = TENANT_TOOLS.find((entry) => entry.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}

export const TOOLS_INDEX = {
  title: "Herramientas para inquilinos",
  description:
    "Cuatro herramientas gratuitas sobre honorarios, fianza, reparaciones y salir del alquiler. Se calculan en el navegador y no se guardan.",
  faqs: [
    {
      question: "¿Estas herramientas son asesoramiento jurídico?",
      answer:
        "No. Son información general y orientativa sobre la Ley de Arrendamientos Urbanos. Cada resultado cita el artículo y, si el caso no está claro, lo dice. El contrato y, en caso de duda, un profesional o la OMIC mandan.",
    },
    {
      question: "¿Fachada guarda lo que escribo?",
      answer:
        "No. Los cálculos se hacen en tu navegador. La carta de la fianza no se envía a ningún servidor. Buscar la agencia para dejar una reseña es otro paso, y solo viaja el nombre que buscas.",
    },
    {
      question: "¿Sirven si el piso está en Madrid?",
      answer:
        "La LAU es estatal, así que las reglas no cambian por ser Madrid. La OMIC sí es la de tu municipio. Si el problema fue con una agencia, puedes contarlo en su ficha de Fachada.",
    },
  ],
} as const;
