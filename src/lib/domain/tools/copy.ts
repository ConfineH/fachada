import type { DepositReady } from "@/lib/domain/tools/deposit";
import type { EarlyExitResult } from "@/lib/domain/tools/early-exit";
import type { FeeCollector, FeeResult } from "@/lib/domain/tools/fees";
import type { RepairResult } from "@/lib/domain/tools/repairs";
import { REPAIR_FLOW } from "@/lib/domain/tools/repairs";
import { formatSpanishDate } from "@/lib/domain/tools/dates";
import { formatEuro } from "@/lib/domain/tools/money";
import { REFORM_2026_ACTIVE, REFORM_2026_START } from "@/lib/domain/tools/constants";
import type { RentNeedsReference, RentReady, RentUpdateResult } from "@/lib/domain/tools/rent-update";

function whenReform(text: string) {
  return REFORM_2026_ACTIVE ? text : "";
}

export const LEGAL_NOTICE =
  "Información general y orientativa, no es asesoramiento jurídico. Revisa tu contrato y, si dudas, consulta a un profesional o a la OMIC de tu municipio.";

export const DEPOSIT_STAYS_LOCAL =
  "Los datos de esta carta no salen del navegador. Fachada no los guarda ni los envía a ningún servidor.";

export const REVIEW_CTA = "¿Fue con una agencia? Cuéntalo en Fachada";

export const CONTRACT_LABELS = {
  vivienda: "Vivienda habitual",
  temporada: "Temporada",
  habitacion: "Habitación",
} as const;

export const FEE_CONCEPT_LABELS = {
  honorarios: "Honorarios",
  gestion: "Gestión",
  solvencia: "Estudio de solvencia",
  otro: "Otro",
} as const;

export const FEE_COLLECTOR_LABELS = {
  agencia: "La agencia",
  arrendador: "El arrendador",
  otro: "Otra persona",
} as const;

export const FIELD_HINTS = {
  euro: "Escribe el importe con céntimos si hace falta. Por ejemplo, 1.200,50.",
  duration: "5 años son 60 meses. 7 años son 84.",
  optionalEnd: "Si sigue en prórroga y no hay fecha de fin, déjalo vacío.",
} as const;

const FEE_TITLES = {
  invalid_date: "Revisa la fecha de firma",
  invalid_amount: "Revisa el importe",
  no_amount: "No hay importe que reclamar",
  before_reform: "Caso dudoso. El contrato es anterior a la reforma",
  seasonal: "Caso dudoso. El contrato es de temporada",
  room: "Caso dudoso. El contrato es de habitación",
  other_concept: "Caso dudoso. El concepto no está claro",
} as const;

const FEE_BODIES = {
  invalid_date: "Hace falta una fecha de firma válida.",
  invalid_amount: "El importe tiene que ser un número de euros, cero o mayor.",
  no_amount: "Con 0 € no hay un cobro que orientar. Si te cobraron otra cantidad, ponla.",
  before_reform:
    "Firmaste antes del 26 de mayo de 2023. La regla que pone la gestión y la formalización a cargo del arrendador entra en vigor ese día y, en general, no alcanza a los contratos ya firmados. Habría que leer qué se pactó entonces.",
  seasonal: `El artículo 20 está en el título de arrendamiento de vivienda. Un contrato de temporada puede ser un uso distinto, y entonces esta prohibición no rige igual${whenReform(", o una vivienda temporal si es posterior al 8 de octubre de 2026 y cumple los requisitos")}. Con este dato no se puede afirmar que el cobro sea indebido.`,
  room: `El alquiler de habitación a menudo queda fuera de la LAU. ${whenReform("Desde el 8 de octubre de 2026 una habitación puede encajar en vivienda temporal si hay un desplazamiento justificado. ")}No es un caso claro.`,
  other_concept: `«Otro» puede ser un gasto de gestión con otro nombre, que no te correspondería, o un servicio opcional que pediste por escrito después de que te informaran del precio. ${whenReform("El artículo 20.2, desde el 8 de octubre de 2026, sí permite ese segundo caso. ")}Sin el concepto exacto y el papel, no se puede afirmar.`,
} as const;

export function feeCollectorLabel(collector: FeeCollector): string {
  if (collector === "agencia") return "la agencia";
  if (collector === "arrendador") return "el arrendador";
  return "quien te lo cobró";
}

export function feeView(result: FeeResult): { title: string; body: string; steps: string[] } {
  if (result.status === "reclaimable") {
    const who = feeCollectorLabel(result.collector);
    const concept =
      result.concept === "solvencia"
        ? ` El estudio de solvencia es un servicio de preparación del contrato: entra en los gastos de gestión y formalización${whenReform(", y desde el 8 de octubre de 2026 la ley lo cubre bajo cualquier nombre")}. Conserva el justificante por si el papel lo llama de otra forma.`
        : " Conserva el justificante del cobro.";
    return {
      title: `Parece un cobro que no te correspondía. Se podrían reclamar ${formatEuro(result.amountEur)}.`,
      body: `En un arrendamiento de vivienda habitual firmado a partir del 26 de mayo de 2023, los gastos de gestión inmobiliaria y de formalización corren a cargo del arrendador. ${whenReform("Desde el 8 de octubre de 2026, el artículo 20.2 prohíbe repercutirlos al arrendatario, directa o indirectamente, bajo cualquier nombre. ")}El importe orientativo es lo que te cobraron.${concept}`,
      steps: [
        `Pide la devolución por escrito a ${who}. Cita el artículo 20 de la LAU y adjunta el justificante.`,
        "Si no contestan o se niegan, presenta una hoja de reclamaciones.",
        "Acude a la OMIC de tu municipio o al organismo de consumo de tu comunidad autónoma.",
        result.lawyerRequired
          ? "Por encima de 2.000 €, la reclamación judicial normalmente exige abogado y procurador. Conviene consultarlo antes de demandar."
          : "Si lo reclamado no supera los 2.000 €, en general puedes presentar un juicio verbal sin abogado ni procurador.",
      ],
    };
  }

  return {
    title: FEE_TITLES[result.code],
    body: FEE_BODIES[result.code],
    steps: [],
  };
}

export function depositView(code: "missing_parties" | "invalid_date" | "invalid_amount" | "end_before_start" | "no_amount" | "keys_before_contract" | "deduction_exceeds"): {
  title: string;
  body: string;
} {
  const copy = {
    missing_parties: {
      title: "Faltan los datos de la carta",
      body: "Hacen falta el nombre de las dos partes y la dirección de la vivienda.",
    },
    invalid_date: {
      title: "Revisa las fechas",
      body: "La fecha de inicio, la de entrega de llaves y, si la pones, la de fin tienen que ser fechas válidas.",
    },
    invalid_amount: {
      title: "Revisa los importes",
      body: "La fianza, las garantías y las deducciones tienen que ser importes en euros, cero o mayores.",
    },
    end_before_start: {
      title: "La fecha de fin es anterior al inicio",
      body: "Así no se puede identificar el contrato. Corrige las fechas antes de generar la carta.",
    },
    no_amount: {
      title: "No hay importe que reclamar",
      body: "Pon la fianza o las garantías adicionales que entregaste.",
    },
    keys_before_contract: {
      title: "Caso dudoso. Las llaves figuran antes del contrato",
      body: "La entrega de llaves no puede ser anterior al inicio del contrato. Sin ese orden no se puede fijar el mes del artículo 36 ni redactar una carta que lo afirme.",
    },
    deduction_exceeds: {
      title: "Caso dudoso. El descuento que aceptas es mayor que lo entregado",
      body: "La fianza más las garantías no cubren ese descuento. No saldría un saldo a tu favor. Revisa las cifras o marca que discutes el descuento.",
    },
  } as const;
  return copy[code];
}

export const DEPOSIT_ART_36 =
  "El artículo 36 de la Ley 29/1994, de Arrendamientos Urbanos, obliga a restituir el saldo de la fianza en el mes siguiente a la entrega de las llaves. Si ese plazo pasa sin devolución, el saldo devenga el interés legal del dinero.";

export function depositDocuments(ready: DepositReady): { letter: string; burofax: string } {
  const deadline = formatSpanishDate(ready.deadline);
  const keys = formatSpanishDate(ready.keysDate);
  const start = formatSpanishDate(ready.contractStart);
  const end = ready.contractEnd ? formatSpanishDate(ready.contractEnd) : null;
  const today = formatSpanishDate(ready.today);
  const claimed = formatEuro(ready.claimedEur);
  const contractSpan = end
    ? `de ${start} a ${end}`
    : `con inicio el ${start}`;

  const lines = [
    `Fianza entregada: ${formatEuro(ready.depositEur)}.`,
  ];
  if (ready.extraEur > 0) {
    lines.push(`Garantías adicionales: ${formatEuro(ready.extraEur)}.`);
  }
  if (ready.deductionEur > 0) {
    const detail = ready.deductionDetail || "conceptos no detallados";
    lines.push(
      ready.acceptDeduction
        ? `Acepto el descuento de ${formatEuro(ready.deductionEur)} por ${detail}. El saldo que pido es ${claimed}.`
        : `Se me ha indicado un descuento de ${formatEuro(ready.deductionEur)} por ${detail}. No lo acepto salvo que se acredite un daño imputable a mí, distinto del desgaste por el uso ordinario. Reclamo ${claimed}.`,
    );
  } else {
    lines.push(`El importe cuya devolución solicito es ${claimed}.`);
  }

  const interest =
    ready.interestStarted
      ? `Ese plazo venció el ${deadline} y el saldo no consta devuelto. Desde el día siguiente devenga el interés legal del dinero.`
      : ready.deadlineStatus === "due_today"
        ? `Ese plazo vence hoy, ${deadline}. Si el ingreso no se hace, desde mañana el saldo devenga el interés legal del dinero.`
        : `Ese plazo vence el ${deadline}. Si pasa sin devolución, el saldo devenga el interés legal del dinero.`;

  const presumption = ready.presumptionApplies
    ? "Si no hay un documento de finalización que anote desperfectos, o no se firmó, el artículo 36.7 presume que la vivienda se entregó en estado adecuado, salvo prueba en contrario."
    : "";
  const excess = [
    ready.excessiveDeposit
      ? "La fianza supera una mensualidad de renta. El artículo 36.1 de la LAU fija la fianza de vivienda en una mensualidad, así que ese exceso puede ser un cobro indebido."
      : "",
    ready.excessiveGuarantee
      ? ready.contractKind === "temporada"
        ? "Las garantías adicionales superan una mensualidad. El artículo 36.5 de la LAU limita esas garantías a una mensualidad en vivienda temporal."
        : "Las garantías adicionales superan dos mensualidades de renta. El artículo 36.5 de la LAU fija ese tope en el arrendamiento de vivienda."
      : "",
  ].filter(Boolean);

  const letter = [
    ready.tenantName,
    ready.address,
    "",
    `A la atención de ${ready.landlordName}`,
    "",
    `Asunto: Devolución de la fianza del arrendamiento de ${ready.address}`,
    "",
    `En relación con el contrato de arrendamiento de la vivienda sita en ${ready.address}, ${contractSpan}, les requiero la devolución de la fianza y, en su caso, de las garantías adicionales.`,
    "",
    `El ${keys} entregué las llaves. ${DEPOSIT_ART_36}`,
    "",
    interest,
    "",
    ...lines,
    "",
    ...excess,
    "",
    presumption,
    "Les ruego el ingreso y la confirmación por escrito. Si alegan daños, necesito el detalle y las facturas.",
    "",
    `Fecha: ${today}.`,
    "",
    ready.tenantName,
  ]
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const burofax = [
    `BUROFAX. ${ready.tenantName} a ${ready.landlordName}.`,
    `Vivienda: ${ready.address}. Contrato ${contractSpan}. Llaves entregadas el ${keys}.`,
    `Requiero la devolución de ${claimed} en concepto de fianza${ready.extraEur > 0 ? " y garantías adicionales" : ""}.`,
    DEPOSIT_ART_36,
    interest,
    ready.deductionEur > 0 && !ready.acceptDeduction
      ? `No acepto el descuento alegado de ${formatEuro(ready.deductionEur)} sin prueba de un daño imputable a mí.`
      : "",
    ...excess,
    presumption,
    "Quedo a la espera del ingreso y de la confirmación escrita.",
  ]
    .filter(Boolean)
    .join(" ");

  return { letter, burofax };
}

const REPAIR_ITEM_LABELS: Record<string, string> = {
  caldera: "Caldera o calentador",
  electrodomesticos: "Electrodomésticos",
  humedades: "Humedades",
  persianas: "Persianas",
  cerraduras: "Cerradura",
  grifos: "Grifos",
  pintura: "Pintura",
};

const REPAIR_SITUATION_LABELS: Record<string, string> = {
  no_funciona: "No da calefacción o agua caliente, y no la he roto yo",
  mal_uso: "Dejó de funcionar por un golpe o un mal uso mío",
  mantenimiento: "Funciona, pero toca la revisión o el mantenimiento",
  incluido_uso: "Estaba en el contrato y se averió con el uso",
  no_incluido: "No estaba incluido en el contrato",
  lo_rompi: "Lo rompí o lo forcé yo",
  filtracion: "Viene de una filtración o de una tubería, y no la causé yo",
  condensacion: "Parece condensación y no sé si basta con ventilar",
  lo_cause: "La causé yo",
  cinta: "Se ha roto la cinta o se ha soltado una lama con el uso",
  mecanismo: "No sube, o falla el motor o el mecanismo, sin golpe mío",
  llaves: "Perdí las llaves o forcé la cerradura",
  no_cierra: "No cierra, no abre o no asegura la vivienda, sin mal uso mío",
  goteo: "Gotea o se ha gastado la junta",
  instalacion: "Hay una fuga importante, no sale agua o falla la instalación, sin mal uso mío",
  desgaste: "Está desgastada o quiero otro color",
  por_humedad: "Hay manchas por una humedad o un defecto del piso",
  la_dane: "La manché o la dañé yo",
  no_se: "No lo tengo claro",
};

const REPAIR_BODIES: Record<string, { title: string; body: string }> = {
  habitabilidad: {
    title: "Normalmente lo paga el arrendador",
    body: "Es una reparación necesaria para que la vivienda siga siendo habitable o sirva al uso pactado. El artículo 21.1 de la LAU la pone a cargo del arrendador, salvo que el daño lo hayas causado tú.",
  },
  culpa: {
    title: "Normalmente lo pagas tú",
    body: "Si el deterioro lo causó el inquilino, el artículo 21.1 deja la reparación fuera del deber del arrendador. Conviene avisarle igual, pero no exigirle que lo pague.",
  },
  pequena: {
    title: "Normalmente lo pagas tú",
    body: "El artículo 21.4 pone a cargo del inquilino las pequeñas reparaciones que exige el desgaste por el uso ordinario. Una cinta de persiana, un goteo o la pintura gastada suelen entrar ahí.",
  },
  no_incluido: {
    title: "No le corresponde al arrendador",
    body: "Si el aparato no estaba en el contrato, conservarlo no es parte del arriendo. El gasto es de quien lo usa.",
  },
  temporal_habitabilidad: {
    title: "Normalmente lo paga el arrendador",
    body: "En vivienda habitual ya lo dice el artículo 21.1. En vivienda temporal, el artículo 21 bis, en vigor desde el 8 de octubre de 2026, mantiene esa conservación a cargo del arrendador. Si tu temporada es anterior a esa fecha, esta parte del deber ya existía para la habitabilidad.",
  },
  mantenimiento: {
    title: "Caso dudoso. La revisión no es lo mismo que la avería",
    body: "La avería que deja sin calefacción o sin agua caliente la paga el arrendador, salvo daño tuyo. El contrato de mantenimiento o la revisión periódica a veces se pacta aparte. Sin ver esa cláusula no se puede decir quién paga la revisión.",
  },
  condensacion: {
    title: "Caso dudoso. La condensación se discute",
    body: "Una filtración o una tubería suele ser del arrendador. La condensación puede venir de no ventilar, y entonces se discute si es uso del inquilino, o de un puente térmico, y entonces es del inmueble. Con este dato no se puede atribuir el pago.",
  },
  causa_desconocida: {
    title: "Caso dudoso. Falta la causa",
    body: "El artículo 21 cambia de responsable según el daño lo hayas causado tú, sea desgaste ordinario o sea necesario para habitar. Sin esa causa, una respuesta tajante sería un error.",
  },
  temporal_desgaste: {
    title: "Caso dudoso en un alquiler de temporada",
    body: "En vivienda habitual esto suele pagarlo el inquilino, por desgaste o porque el daño es suyo. En vivienda temporal, el artículo 21 bis, desde el 8 de octubre de 2026, pone también las pequeñas reparaciones a cargo del arrendador, y lo dice «en todo caso». Si tu contrato de temporada es anterior, puede seguir la regla antigua. No se puede cerrar quién paga.",
  },
  habitacion: {
    title: "Caso dudoso. Es una habitación",
    body: `El artículo 21 regula la vivienda. Una habitación a menudo queda fuera de la LAU. ${whenReform("Desde el 8 de octubre de 2026 puede encajar en vivienda temporal si hay un desplazamiento justificado, y entonces el artículo 21 bis carga la conservación al arrendador. ")}No es un caso claro.`,
  },
};

export function repairItemLabel(id: string): string {
  return REPAIR_ITEM_LABELS[id] ?? id;
}

export function repairSituationLabel(id: string): string {
  return REPAIR_SITUATION_LABELS[id] ?? id;
}

export function repairItemsForUi() {
  return REPAIR_FLOW.map((item) => ({
    id: item.id,
    label: repairItemLabel(item.id),
    situations: item.situations.map((situation) => ({
      id: situation.id,
      label: repairSituationLabel(situation.id),
    })),
  }));
}

export function repairView(result: Exclude<RepairResult, { status: "incomplete" }>): {
  title: string;
  body: string;
  steps: string[];
  message: string;
} {
  const code = result.status === "answered" ? result.nuance : result.code;
  const text = REPAIR_BODIES[code] ?? {
    title: "Caso dudoso",
    body: "Con estos datos no se puede decir quién paga.",
  };
  const item = result.item ? repairItemLabel(result.item) : "la reparación";
  const situation = result.situation ? repairSituationLabel(result.situation) : "";
  const payer = result.status === "answered" ? result.payer : "dudoso";

  return {
    title: text.title,
    body: text.body,
    steps: repairSteps(payer, code),
    message: repairMessage({
      payer,
      item,
      situation,
      temporal: code === "temporal_habitabilidad",
    }),
  };
}

function repairSteps(payer: "arrendador" | "inquilino" | "dudoso", code: string): string[] {
  if (payer === "arrendador" && code === "temporal_habitabilidad") {
    return [
      "Avísale por escrito en cuanto puedas y facilita una visita.",
      "En vivienda temporal, el artículo 21 bis le da cinco días hábiles para responder. Si no lo hace, puedes hacer la reparación urgente, justificar el gasto y pedirle el importe o descontarlo de la renta del mes siguiente.",
      "Si la vivienda es tu residencia habitual y no temporal, usa el artículo 21.5: requerimiento con un presupuesto y quince días naturales.",
    ];
  }
  if (payer === "arrendador") {
    return [
      "Avísale por escrito en cuanto puedas. Describe el fallo, desde cuándo ocurre y que no lo causaste tú.",
      "Facilita que lo vea él o un técnico.",
      "Si es urgente, para evitar un daño inminente o una incomodidad grave, el artículo 21.3 permite hacer la reparación previa comunicación y exigir el importe de inmediato.",
      whenReform(
        "Desde el 8 de octubre de 2026, el artículo 21.5 permite un requerimiento escrito con un presupuesto razonable. Tiene quince días naturales para aceptar, proponer otra reparación o hacerla. Si no responde o se niega sin motivo, puedes ejecutarla y descontar el coste de rentas futuras, con las facturas.",
      ),
    ].filter((step): step is string => Boolean(step));
  }
  if (payer === "inquilino") {
    return [
      "El gasto, con esta orientación, es tuyo. No hace falta exigir que lo pague el arrendador.",
      "Puedes avisarle por escrito si quieres dejar constancia, sobre todo si vas a entrar en la instalación.",
    ];
  }
  return [
    "No escribas dando por hecho quién paga.",
    "Describe qué pasa, desde cuándo y qué has comprobado, y pide que lo revisen con el contrato y el artículo 21 delante.",
  ];
}

function repairMessage(input: {
  payer: "arrendador" | "inquilino" | "dudoso";
  item: string;
  situation: string;
  temporal: boolean;
}): string {
  const fact = input.situation
    ? `Le escribo por ${input.item.toLowerCase()}: ${input.situation.charAt(0).toLowerCase()}${input.situation.slice(1)}.`
    : `Le escribo por ${input.item.toLowerCase()} en la vivienda que tengo arrendada.`;

  if (input.payer === "arrendador") {
    const legal = input.temporal
      ? "El artículo 21 bis de la LAU pone a cargo del arrendador la conservación de la vivienda temporal, también las pequeñas reparaciones de desgaste."
      : "El artículo 21.1 de la LAU pone a cargo del arrendador las reparaciones necesarias para conservar la vivienda en condiciones de habitabilidad, salvo un daño causado por el inquilino. Este no lo he causado yo.";
    return [
      "Hola,",
      "",
      `Soy el inquilino de la vivienda. ${fact}`,
      "",
      legal,
      "",
      "Le pido que lo repare. Puedo facilitar una visita. Si necesita un presupuesto, se lo hago llegar.",
      "",
      "Gracias.",
    ].join("\n");
  }

  if (input.payer === "inquilino") {
    return [
      "Hola,",
      "",
      `Soy el inquilino de la vivienda. ${fact}`,
      "",
      "Se lo comunico para que conste. Asumo el coste de esta reparación.",
      "",
      "Gracias.",
    ].join("\n");
  }

  return [
    "Hola,",
    "",
    `Soy el inquilino de la vivienda. ${fact}`,
    "",
    "¿Puede revisarlo y decirme cómo seguimos, según el contrato y el artículo 21 de la LAU? No doy por hecho quién debe pagarlo.",
    "",
    "Gracias.",
  ].join("\n");
}

export function earlyExitView(
  result: EarlyExitResult,
): { title: string; body: string; compensationTitle: string; compensationBody: string } {
  if (result.status === "invalid" || result.status === "doubtful") {
    const doubtful = {
      invalid_date: {
        title: "Revisa las fechas",
        body: "La fecha de inicio y la de salida tienen que ser válidas.",
      },
      invalid_duration: {
        title: "Revisa la duración",
        body: "La duración pactada tiene que ser un número entero de meses, entre 1 y 600.",
      },
      invalid_rent: {
        title: "Revisa la renta",
        body: "Hace falta la renta mensual, mayor que cero, para orientar la indemnización.",
      },
      exit_before_start: {
        title: "La salida es anterior al inicio",
        body: "Con ese orden no hay un desistimiento que calcular.",
      },
      seasonal: {
        title: "Caso dudoso. Es un contrato de temporada",
        body: `El artículo 11.1 (seis meses y treinta días) es el de vivienda habitual. Un temporada puede ser un uso distinto, y entonces este artículo no rige. ${whenReform("Si es vivienda temporal posterior al 8 de octubre de 2026, el artículo 11.2 permite irse al mes, con diez días de preaviso, y el 11.3 dice que no genera indemnización. ")}No se puede dar una sola respuesta.`,
      },
      room: {
        title: "Caso dudoso. Es una habitación",
        body: `El artículo 11 regula el arrendamiento de vivienda. Una habitación a menudo queda fuera de la LAU. ${whenReform("Desde el 8 de octubre de 2026 puede ser vivienda temporal, con otro plazo. ")}No se puede decir si puedes irte ni si hay indemnización.`,
      },
    } as const;
    const code = result.status === "invalid" ? result.code : result.code;
    const text = doubtful[code];
    return {
      title: text.title,
      body: text.body,
      compensationTitle: "Indemnización",
      compensationBody: "No hay una cifra. El caso no está claro o faltan datos.",
    };
  }

  const end = formatSpanishDate(result.endDate);
  const earliest = formatSpanishDate(result.earliestExit);
  const notice = result.noticeDeadline ? formatSpanishDate(result.noticeDeadline) : null;
  const leave = leaveCopy(result.status, earliest, end, notice, result.plannedExitDate);
  const compensation = compensationCopy(result);

  return {
    title: leave.title,
    body: leave.body,
    compensationTitle: compensation.title,
    compensationBody: compensation.body,
  };
}

function leaveCopy(
  status: "right_never" | "too_soon" | "can_leave" | "term_ended",
  earliest: string,
  end: string,
  notice: string | null,
  plannedIso: string,
): { title: string; body: string } {
  const planned = formatSpanishDate(plannedIso);
  if (status === "right_never") {
    return {
      title: "Con esta duración el desistimiento no llega a usarse",
      body: `El artículo 11.1 permite irse cuando han pasado al menos seis meses, con treinta días de preaviso. Este contrato acaba el ${end}, el mismo día en que nacería ese derecho o antes (${earliest}). Irse antes no es este desistimiento: sería otra cosa, y aquí no se calcula.`,
    };
  }
  if (status === "term_ended") {
    return {
      title: "No hace falta desistir",
      body: `La salida prevista (${planned}) es el fin del contrato (${end}) o posterior. Cumplir el plazo no es una salida anticipada del artículo 11.`,
    };
  }
  if (status === "too_soon") {
    return {
      title: "Todavía no puedes irte en esa fecha",
      body: `Para usar el artículo 11.1 tienen que haber pasado seis meses. La primera salida posible es el ${earliest}. El preaviso es de treinta días: para salir ese día, el aviso tiene que llegar como tarde el ${notice}. Si esa fecha ya pasó, cuenta treinta días desde el día en que avises y no salgas antes del ${earliest}.`,
    };
  }
  return {
    title: "Puedes irte en la fecha prevista",
    body: `Han pasado los seis meses del artículo 11.1. Para salir el ${planned}, el preaviso de treinta días tiene que llegar como tarde el ${notice}. Si ese día ya pasó, retrasa la salida a treinta días después del aviso. El contrato, si no desistes, sigue hasta el ${end}.`,
  };
}

function compensationCopy(
  result: Extract<EarlyExitResult, { status: "right_never" | "too_soon" | "can_leave" | "term_ended" }>,
): { title: string; body: string } {
  const basisDate =
    result.compensationBasis === "earliest" ? result.earliestExit : result.plannedExitDate;
  const when =
    result.compensationBasis === "earliest"
      ? `si salieras el ${formatSpanishDate(basisDate)}, que es la primera fecha posible`
      : `para la salida del ${formatSpanishDate(basisDate)}`;

  if (result.status === "right_never") {
    return {
      title: "Indemnización del artículo 11",
      body: "No aplica: este contrato no deja un hueco en el que usar el desistimiento.",
    };
  }
  if (result.status === "term_ended") {
    return {
      title: "Indemnización del artículo 11",
      body: "No hay periodo que indemnizar. La salida no es anterior al fin pactado.",
    };
  }
  if (result.compensation.status === "zero" && result.compensation.code === "barred") {
    return {
      title: "Indemnización: 0 €",
      body: "El contrato es del 8 de octubre de 2026 o posterior. El artículo 11.3 dice que este desistimiento no genera indemnización a favor del arrendador, aunque el papel la pacte. Conserva el contrato por si la cláusula habla de otra cosa.",
    };
  }
  if (result.compensation.status === "zero" && result.compensation.code === "not_agreed") {
    return {
      title: "Indemnización: 0 €",
      body: `La ley no impone una indemnización por irte. Solo podía exigirse si el contrato la pactaba, y has marcado que no. ${whenReform("Desde el 8 de octubre de 2026 el artículo 11.3 dice, además, que el desistimiento no genera ese derecho; en un contrato anterior esa frase nueva es un matiz, no lo que decides aquí.")}`.trim(),
    };
  }
  if (result.compensation.status === "zero" && result.compensation.code === "nothing_left") {
    return {
      title: "Indemnización: 0 €",
      body: "No queda tiempo de contrato que prorratear.",
    };
  }
  if (result.compensation.status === "doubtful_cap") {
    return {
      title: "Indemnización: caso dudoso",
      body: `El artículo 11 ${REFORM_2026_ACTIVE ? "anterior al 8 de octubre de 2026 " : ""}permitía pactar como máximo una mensualidad por cada año que faltara, en proporción por los periodos menores. ${when.charAt(0).toUpperCase()}${when.slice(1)}, ese tope es ${formatEuro(result.compensation.eur)}. ${whenReform("Desde esa fecha, el artículo 11.3 dice que el desistimiento no genera indemnización. ")}No puedo decirte si un pacto sigue siendo exigible: no des esa cifra por debida.`,
    };
  }
  return {
    title: "Indemnización",
    body: "No queda periodo que prorratear.",
  };
}

/** Porcentaje con coma decimal, sin ceros de más. */
export function formatPercent(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const [whole, fraction] = rounded.toFixed(2).split(".");
  if (!fraction || fraction === "00") return `${whole} %`;
  const digits = fraction.endsWith("0") ? fraction.slice(0, 1) : fraction;
  return `${whole},${digits} %`;
}

const RENT_INDEX_LABELS = {
  irav: "al IRAV",
  ipc: "al IPC",
  igc: "al índice de garantía de competitividad",
  otro: "al índice pactado",
} as const;

export const IRAV_ESTIMATE_NOTE =
  "La fecha de publicación del INE es estimada; comprueba en ine.es qué IRAV estaba publicado ese día.";

function estimateLine(close: boolean) {
  return close ? `\n${IRAV_ESTIMATE_NOTE}` : "";
}

function anniversaryLine(onAnniversary: boolean) {
  return onAnniversary
    ? "La fecha cae en el aniversario del contrato, que es cuando el artículo 18 permite actualizar."
    : "El artículo 18 solo permite actualizar el día en que se cumple cada año de contrato. En otra fecha la subida no es exigible.";
}

export function rentUpdateView(result: RentUpdateResult): { title: string; body: string } {
  if (result.status === "invalid") {
    const bodies = {
      invalid_date: "Revisa la fecha de firma y la de la actualización.",
      invalid_rent: "La renta tiene que ser un importe en euros, mayor que cero.",
      update_before_contract: "La actualización no puede ser anterior a la firma del contrato.",
      choose_clause: "Indica si el contrato prevé la actualización anual de la renta.",
      choose_index: "Indica qué índice menciona el contrato.",
      choose_reference:
        "Para esta fecha hace falta saber si la renta supera el índice de precios de referencia. Si no lo sabes, márcalo: no te doy una sola cifra.",
    };
    return { title: "Falta un dato", body: bodies[result.code] };
  }
  if (result.status === "unsupported_period") {
    return {
      title: "Esta calculadora no cubre ese año",
      body: `La actualización es de ${result.year}. Antes de 2023 el tope no era el 2 %, el 3 % ni el IRAV, y aquí no hay una serie de aquel índice. No invento el porcentaje.`,
    };
  }
  if (result.status === "missing_irav") {
    const pending = result.month ? ` El mes ${result.month} todavía no está publicado en la tabla.` : "";
    return {
      title: "No hay IRAV publicado en esa fecha",
      body: `El artículo 18 toma el último índice publicado en la fecha de la actualización. En esa fecha la tabla no tiene ninguno.${pending} No invento el porcentaje. ${anniversaryLine(result.onAnniversary)}`,
    };
  }
  if (result.status === "agreed_index") {
    const why =
      result.updateDate >= REFORM_2026_START && !result.reformActive
        ? "El RDL 29/2026 no se aplica, así que tampoco el tope que desde el 8 de octubre de 2026 extiende el IRAV a los contratos anteriores al 26 de mayo de 2023."
        : "La disposición transitoria cuarta de la Ley 12/2023 dejó los contratos anteriores al 26 de mayo de 2023 en el régimen de la firma. El IRAV no los limita.";
    return {
      title: "Manda el índice del contrato",
      body: `${why} Se aplica el índice pactado, por ejemplo el IPC del mes que fije la cláusula. No doy una cifra. ${anniversaryLine(result.onAnniversary)}`,
    };
  }
  if (result.status === "needs_reference") {
    return {
      title: "Depende del índice de precios de referencia",
      body: `Entre el 8 de octubre de 2026 y el 31 de diciembre de 2027, la disposición final sexta del RDL 29/2026 impide subir la renta si ya supera ese índice. Si no lo supera y no hay un pacto nuevo, el tope es ${formatPercent(result.percentIfWithin)} (el menor entre el 2 % y el IRAV de ${result.iravMonth}, que es ${formatPercent(result.iravValue)}): la renta máxima sería ${formatEuro(result.maxIfWithin)}. Si sí lo supera, la renta se queda en ${formatEuro(result.maxIfAbove)}. ${anniversaryLine(result.onAnniversary)}${estimateLine(result.iravEstimateClose)}`,
    };
  }
  return { title: rentReadyTitle(result), body: rentReadyBody(result) };
}

function rentReadyTitle(result: RentReady): string {
  if (result.basis === "no_pact") return "No hay subida";
  if (result.exceeds) return "Te piden más del tope";
  if (result.exceeds === false) return "La cantidad pedida no pasa el tope";
  return `Renta máxima: ${formatEuro(result.maxRentEur)}`;
}

function rentReadyBody(result: RentReady): string {
  const anniversary = anniversaryLine(result.onAnniversary);
  if (result.basis === "no_pact") {
    return `El artículo 18.1 de la LAU dice que, si no hay pacto expreso, no se actualiza la renta durante el contrato. La renta sigue en ${formatEuro(result.currentRentEur)}. ${anniversary}`;
  }
  const index = result.index
    ? ` El contrato remite ${RENT_INDEX_LABELS[result.index]}: si ese índice diera menos que el tope, manda el menor.`
    : "";
  const cap =
    result.basis === "cap_2023"
      ? "En 2023 el tope legal de la actualización fue el 2 %. Si el arrendador no es gran tenedor, ese 2 % aplicaba salvo nuevo pacto entre las partes."
      : result.basis === "cap_2024"
        ? "En 2024 el tope legal de la actualización fue el 3 %. Si el arrendador no es gran tenedor, ese 3 % aplicaba salvo nuevo pacto entre las partes."
        : result.basis === "extraordinary_zero"
          ? "La disposición final sexta del RDL 29/2026 impide cualquier incremento cuando la renta supera el índice de precios de referencia."
          : result.basis === "extraordinary_two"
            ? `Hasta el 31 de diciembre de 2027, si no hay un pacto nuevo, el tope es el menor entre el 2 % y el IRAV de ${result.iravMonth} (${formatPercent(result.iravValue ?? 0)}).`
            : `Desde 2025 el tope es el IRAV del INE. El mes de referencia es ${result.iravMonth} (${formatPercent(result.iravValue ?? 0)}).`;
  const money = `Sobre ${formatEuro(result.currentRentEur)}, la renta máxima es ${formatEuro(result.maxRentEur)} (${formatPercent(result.percent)}).`;
  const asked =
    result.exceeds === null
      ? ""
      : result.exceeds
        ? ` Te piden ${formatEuro(result.askedRentEur ?? 0)}, por encima de ese tope.`
        : ` Lo que te piden, ${formatEuro(result.askedRentEur ?? 0)}, no supera ese tope.`;
  return `${cap} ${money}${asked}${index} ${anniversary}${estimateLine(result.iravEstimateClose)}`;
}

export function rentUpdateReply(result: RentReady): string | null {
  if (!result.exceeds) return null;
  return [
    "He revisado la actualización de la renta que me propones.",
    `El artículo 18 de la LAU solo permite actualizar la renta si el contrato lo prevé, y el incremento no puede pasar del tope legal aplicable. Con la renta actual de ${formatEuro(result.currentRentEur)}, el máximo es ${formatEuro(result.maxRentEur)} (${formatPercent(result.percent)}).`,
    `La cantidad de ${formatEuro(result.askedRentEur ?? 0)} lo supera. Pagaré como máximo ${formatEuro(result.maxRentEur)}.`,
  ].join("\n\n");
}

export function rentNeedsReferenceReply(result: RentNeedsReference): string | null {
  if (result.askedRentEur === null) return null;
  if (result.askedRentEur <= result.maxIfWithin + 0.001) return null;
  return [
    "He revisado la actualización de la renta que me propones.",
    `Aunque la renta no supere el índice de precios de referencia, el tope hasta el 31 de diciembre de 2027 es ${formatEuro(result.maxIfWithin)} (${formatPercent(result.percentIfWithin)}). Si lo supera, no procede incremento y la renta sigue en ${formatEuro(result.maxIfAbove)}.`,
    `La cantidad de ${formatEuro(result.askedRentEur)} queda por encima de las dos posibilidades.`,
  ].join("\n\n");
}
