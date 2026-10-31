import {
  BOE_ART,
  BOE_LEY_12_2023,
  REFORM_2026_ACTIVE,
  TOOL_TEXTS_REVIEWED_ON,
  reformStatuteLinks,
} from "@/lib/domain/tools/constants";

function whenReform(text: string) {
  return REFORM_2026_ACTIVE ? text : "";
}

export type ToolFaq = { question: string; answer: string };

export type ToolDefinition = {
  id:
    | "honorarios"
    | "fianza"
    | "reparaciones"
    | "salida-anticipada"
    | "acta-entrega-llaves"
    | "subida-alquiler";
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
      "Mira si puedes reclamar honorarios de la inmobiliaria en el alquiler, la gestión o el estudio de solvencia. El artículo 20 de la LAU los carga al arrendador.",
    card: "Si te cobraron gestión, honorarios o un estudio de solvencia al firmar el alquiler.",
    articleLabel: "Artículo 20 de la LAU",
    articleUrl: BOE_ART.fees,
    articleNote:
      `Desde el 26 de mayo de 2023 (Ley 12/2023) los gastos de gestión inmobiliaria y de formalización corren a cargo del arrendador. ${whenReform("Desde el 8 de octubre de 2026, el apartado 2 prohíbe repercutirlos al arrendatario, directa o indirectamente, bajo cualquier nombre.")}`.trim(),
    extraLinks: [
      { href: BOE_LEY_12_2023, label: "Ley 12/2023" },
      ...reformStatuteLinks(REFORM_2026_ACTIVE),
    ],
    faqs: [
      {
        question: "¿Desde cuándo no pueden cobrarme los honorarios de la agencia?",
        answer:
          `Desde el 26 de mayo de 2023, en los arrendamientos de vivienda habitual, los gastos de gestión inmobiliaria y de formalización del contrato corren a cargo del arrendador. ${whenReform("El 8 de octubre de 2026 el artículo 20.2 reforzó esa regla: no pueden repercutirse al inquilino, ni directa ni indirectamente, bajo ningún concepto.")}`.trim(),
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
      "Carta y burofax para reclamar la fianza del alquiler. El artículo 36 de la LAU da un mes desde la entrega de llaves. Se hace en el navegador y no se guarda.",
    card: "Prepara la carta y el texto del burofax cuando no te devuelven la fianza.",
    articleLabel: "Artículo 36 de la LAU",
    articleUrl: BOE_ART.deposit,
    articleNote:
      `El saldo de la fianza debe devolverse en el mes siguiente a la entrega de las llaves. Si no se hace, devenga el interés legal del dinero. ${whenReform("Desde el 8 de octubre de 2026, si no hay un documento de finalización que anote desperfectos, se presume que la vivienda se entregó en buen estado. Un temporada iniciado antes de esa fecha sigue como uso distinto y no tiene esa presunción.")}`.trim(),
    extraLinks: reformStatuteLinks(REFORM_2026_ACTIVE),
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
          "La carta puede incluirlas junto a la fianza. Si indicas la renta y las fechas, avisa cuando las garantías superan el tope del artículo 36.5: dos mensualidades en vivienda de hasta cinco años, o de hasta siete si el arrendador es persona jurídica, y una en temporada desde el 8 de octubre de 2026. Lo que la fianza pase de una mensualidad no se trata como cobro indebido si cabe en esa garantía.",
      },
    ],
  },
  {
    id: "reparaciones",
    path: "/herramientas/reparaciones",
    label: "¿Quién paga la reparación?",
    title: "¿Quién paga las reparaciones del alquiler?",
    description:
      "Caldera, humedades, persianas o grifos: quién paga cada reparación del alquiler según el artículo 21 de la LAU. Si el caso es dudoso, lo dice.",
    card: "Caldera, humedades, persianas, grifos y otros desperfectos frecuentes.",
    articleLabel: "Artículo 21 de la LAU",
    articleUrl: BOE_ART.repairs,
    articleNote:
      `El arrendador paga las reparaciones necesarias para la habitabilidad, salvo que el daño lo haya causado el inquilino. El inquilino paga las pequeñas reparaciones por el desgaste del uso ordinario. ${whenReform("Desde el 8 de octubre de 2026, el apartado 5 fija un requerimiento escrito y quince días naturales, y el artículo 21 bis trata la vivienda temporal.")}`.trim(),
    extraLinks: reformStatuteLinks(REFORM_2026_ACTIVE),
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
          `Hay una plantilla de mensaje. En las reparaciones que le corresponden, el artículo 21.3 pide avisar pronto y dejarle ver la vivienda. ${whenReform("Desde el 8 de octubre de 2026, el artículo 21.5 permite un requerimiento con presupuesto y un plazo de quince días naturales.")}`.trim(),
      },
    ],
  },
  {
    id: "salida-anticipada",
    path: "/herramientas/salida-anticipada",
    label: "Salir antes del contrato",
    title: "Desistir del alquiler antes de tiempo",
    description:
      "Calcula si puedes desistir y salir del alquiler tras seis meses, con treinta días de preaviso, y la indemnización del artículo 11 de la LAU.",
    card: "Seis meses, treinta días de preaviso y el tope de indemnización si estaba pactada.",
    articleLabel: "Artículo 11 de la LAU",
    articleUrl: BOE_ART.earlyExit,
    articleNote:
      `En vivienda habitual puedes desistir cuando han pasado al menos seis meses, avisando con treinta días. Se podía pactar como máximo una mensualidad por cada año que faltara, en proporción. ${whenReform("Desde el 8 de octubre de 2026, el artículo 11.3 dice que este desistimiento no genera indemnización.")}`.trim(),
    extraLinks: reformStatuteLinks(REFORM_2026_ACTIVE),
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
          `Si el contrato pactaba indemnización, el tope es una mensualidad de renta por cada año que falte, y la parte proporcional si falta menos de un año. ${whenReform("El artículo 11.3, en vigor desde el 8 de octubre de 2026, dice que el desistimiento no genera indemnización. En un contrato anterior la herramienta muestra el tope antiguo y lo marca como dudoso.")}`.trim(),
      },
      {
        question: "¿Sirve para temporada o habitación?",
        answer:
          "No da una respuesta cerrada. El artículo 11.1 es de vivienda habitual. La temporada y la habitación pueden estar fuera de esa regla o, si son recientes, en el régimen de vivienda temporal, con otro plazo.",
      },
    ],
  },
  {
    id: "acta-entrega-llaves",
    path: "/herramientas/acta-entrega-llaves",
    label: "Acta de entrega de llaves",
    title: "Acta de entrega de llaves del alquiler",
    description:
      "Acta entrega llaves alquiler, al entrar o al salir del piso: estancias, fotos, contadores y firmas. El PDF se genera en el navegador y no se envía.",
    card: "Deja por escrito el estado del piso, con fotos y la firma de las dos partes.",
    articleLabel: "Artículo 36 de la LAU",
    articleUrl: BOE_ART.deposit,
    articleNote:
      `El artículo 21.4 deja en el inquilino las pequeñas reparaciones del desgaste ordinario. El deterioro por el tiempo, sin culpa, no justifica retener la fianza. ${whenReform("Desde el 8 de octubre de 2026, el artículo 36.7 exige un documento de finalización y, si no se firma o no anota desperfectos, presume que la vivienda se devolvió en buen estado.")} Revisado el ${TOOL_TEXTS_REVIEWED_ON}.`.trim(),
    extraLinks: [
      { href: BOE_ART.repairs, label: "Artículo 21 de la LAU" },
      ...reformStatuteLinks(REFORM_2026_ACTIVE),
    ],
    faqs: [
      {
        question: "¿El desgaste normal lo paga el inquilino?",
        answer:
          "Las pequeñas reparaciones que exija el uso ordinario, sí: lo dice el artículo 21.4. El deterioro que produce el tiempo, sin culpa del inquilino, no es un daño para descontar de la fianza. El artículo 21.1 remite a los artículos 1.563 y 1.564 del Código Civil, y el 36 regula la devolución.",
      },
      {
        question: "¿Para qué sirve el acta al salir?",
        answer:
          `Sirve para anotar el estado el día de las llaves, con fotos y las dos firmas. ${whenReform("Desde el 8 de octubre de 2026, el artículo 36.7 pide un documento de finalización. Si no se firma, o no se anotan desperfectos, se presume que la vivienda se devolvió en buen estado.")}`.trim(),
      },
      {
        question: "¿Fachada guarda las fotos o las firmas?",
        answer:
          "No. Se quedan en este dispositivo, en el almacenamiento local del navegador. El PDF y el archivo para comparar se descargan aquí. El código del PDF es un resumen SHA-256 del contenido, no un sello de tiempo oficial.",
      },
      {
        question: "¿Puedo usar el acta para reclamar la fianza?",
        answer:
          "Sí, si quieres. Desde el acta puedes pasar la dirección, los nombres, la fecha de llaves y los elementos marcados como dañados a la carta de reclamación. No se rellena sola.",
      },
    ],
  },
  {
    id: "subida-alquiler",
    path: "/herramientas/subida-alquiler",
    label: "Subida del alquiler",
    title: "¿Cuánto me pueden subir el alquiler?",
    description:
      "Calcula cuánto me pueden subir el alquiler en 2026: sin pacto no hay subida; con pacto se aplica el tope de 2023, el de 2024 o el IRAV.",
    card: "Mira el tope legal de la actualización y si lo que te piden lo pasa.",
    articleLabel: "Artículo 18 de la LAU",
    articleUrl: BOE_ART.rent,
    articleNote:
      `Sin pacto expreso no hay actualización durante el contrato. Con pacto, en 2023 el tope fue el Índice de Garantía de Competitividad publicado en la fecha de la actualización, en 2024 el 3 % y desde 2025 el IRAV. ${whenReform("Del 8 de octubre de 2026 al 31 de diciembre de 2027, la disposición final sexta del RDL 29/2026 impide subir la renta si supera el índice de precios de referencia y, sin pacto nuevo, la limita al 2 %.")} Revisado el ${TOOL_TEXTS_REVIEWED_ON}.`.trim(),
    extraLinks: [
      { href: BOE_LEY_12_2023, label: "Ley 12/2023" },
      ...reformStatuteLinks(REFORM_2026_ACTIVE),
    ],
    faqs: [
      {
        question: "¿Me pueden subir el alquiler si el contrato no lo dice?",
        answer:
          "No durante el contrato. El artículo 18.1 de la LAU dice que, en defecto de pacto expreso, no se aplica actualización de rentas.",
      },
      {
        question: "¿Cuál es el tope si el contrato sí prevé la actualización?",
        answer:
          `En las actualizaciones de 2023 el tope fue el Índice de Garantía de Competitividad, el último publicado en esa fecha, y en las de 2024 el 3 %. Desde 2025 el límite es el IRAV que publica el INE, el del último mes disponible en la fecha de la actualización. ${whenReform("Entre el 8 de octubre de 2026 y el 31 de diciembre de 2027 hay un límite extra: si la renta supera el índice de precios de referencia no sube, y si no lo supera y no hay un pacto nuevo, no puede pasar del 2 %.")}`.trim(),
      },
      {
        question: "¿De dónde sale el IRAV?",
        answer:
          "De la serie IRAV1 del INE, copiada en la aplicación. Si el mes que corresponde no está cargado, la calculadora lo dice y no usa otro mes. No consulta al INE al calcular.",
      },
      {
        question: "¿La subida vale en cualquier mes?",
        answer:
          "No. El artículo 18 solo permite actualizarla el día en que se cumple cada año de vigencia del contrato. La renta nueva se exige desde el mes siguiente al aviso por escrito.",
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
  title: "Calculadoras de alquiler para inquilinos",
  description:
    "Honorarios de agencia, carta de fianza, reparaciones, desistimiento, acta de llaves y subida del alquiler. Gratuitas, en el navegador, según la LAU.",
  faqs: [
    {
      question: "¿Estas herramientas son asesoramiento jurídico?",
      answer:
        "No. Son información general y orientativa sobre la Ley de Arrendamientos Urbanos. Cada resultado cita el artículo y, si el caso no está claro, lo dice. El contrato y, en caso de duda, un profesional o la OMIC mandan.",
    },
    {
      question: "¿Fachada guarda lo que escribo?",
      answer:
        "No sale de tu navegador. La carta de la fianza no se envía a ningún servidor. El acta de llaves se guarda solo en este dispositivo. Buscar la agencia para dejar una reseña es otro paso, y solo viaja el nombre que buscas.",
    },
    {
      question: "¿Sirven si el piso está en Madrid?",
      answer:
        "La LAU es estatal, así que las reglas no cambian por ser Madrid. La OMIC sí es la de tu municipio. Si el problema fue con una agencia, puedes contarlo en su ficha de Fachada.",
    },
  ],
} as const;
