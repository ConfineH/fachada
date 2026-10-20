/**
 * Listas editables del prefiltro. Un solo módulo.
 * Bloqueo: el autor tiene que corregir el texto antes de enviarlo.
 * Retención: puede enviarlo, pero no se publica y pasa a revisión humana.
 */

export const BANNED_EXPRESSIONS = [
  "gilipollas",
  "imbécil",
  "idiota",
  "subnormal",
  "hijo de puta",
  "hija de puta",
  "hijos de puta",
  "cabron",
  "cabrón",
  "cabrona",
  "puta",
  "puto",
  "putos",
  "putas",
  "mierda",
  "estúpido",
  "estúpida",
  "malnacido",
  "malnacida",
  "zorra",
  "maricón",
  "maricon",
];

export const CRIME_ACCUSATION_TERMS = [
  "estafa",
  "estafas",
  "estafador",
  "estafadora",
  "estafadores",
  "estafadoras",
  "estafaron",
  "estafado",
  "estafados",
  "robo",
  "robos",
  "robaron",
  "robado",
  "robada",
  "ladrón",
  "ladrona",
  "ladrones",
  "ladronas",
  "delito",
  "delitos",
  "delincuente",
  "delincuentes",
  "timo",
  "timos",
  "timador",
  "timadores",
  "fraude",
  "fraudes",
  "criminal",
  "criminales",
];

/** Ciudades, barrios y lugares que no deben contar como nombre de persona. */
export const PLACE_ALLOWLIST = [
  "madrid",
  "barcelona",
  "valencia",
  "sevilla",
  "zaragoza",
  "málaga",
  "malaga",
  "murcia",
  "palma",
  "bilbao",
  "alicante",
  "córdoba",
  "cordoba",
  "valladolid",
  "vigo",
  "gijón",
  "gijon",
  "granada",
  "vitoria",
  "elche",
  "oviedo",
  "santander",
  "pamplona",
  "salamanca",
  "burgos",
  "león",
  "leon",
  "cádiz",
  "cadiz",
  "tarragona",
  "girona",
  "gerona",
  "lleida",
  "lérida",
  "lerida",
  "logroño",
  "logrono",
  "badajoz",
  "cáceres",
  "caceres",
  "toledo",
  "guadalajara",
  "albacete",
  "huesca",
  "teruel",
  "soria",
  "ávila",
  "avila",
  "segovia",
  "zamora",
  "palencia",
  "ourense",
  "orense",
  "lugo",
  "pontevedra",
  "a coruña",
  "coruña",
  "coruna",
  "santiago",
  "ceuta",
  "melilla",
  "marbella",
  "móstoles",
  "mostoles",
  "alcalá",
  "alcala",
  "fuenlabrada",
  "leganés",
  "leganes",
  "getafe",
  "alcorcón",
  "alcorcon",
  "pozuelo",
  "alcobendas",
  "majadahonda",
  "las rozas",
  "rivas",
  "coslada",
  "torrejón",
  "torrejon",
  "parla",
  "pinto",
  "valdemoro",
  "aranjuez",
  "colmenar",
  "tres cantos",
  "boadilla",
  "san sebastián de los reyes",
  "hospitalet",
  "badalona",
  "terrassa",
  "sabadell",
  "mataró",
  "mataro",
  "reus",
  "castellón",
  "castellon",
  "elche",
  "jerez",
  "almería",
  "almeria",
  "huelva",
  "jaén",
  "jaen",
  "donostia",
  "san sebastián",
  "san sebastian",
  "chamberí",
  "chamberi",
  "chamartín",
  "chamartin",
  "tetuán",
  "tetuan",
  "arganzuela",
  "retiro",
  "argüelles",
  "arguelles",
  "moncloa",
  "latina",
  "carabanchel",
  "usera",
  "vallecas",
  "moratalaz",
  "hortaleza",
  "barajas",
  "vicálvaro",
  "vicalvaro",
  "villaverde",
  "canillejas",
  "prosperidad",
  "embajadores",
  "lavapiés",
  "lavapies",
  "malasaña",
  "malasana",
  "chueca",
  "justicia",
  "palacio",
  "cortes",
  "ibiza",
  "goya",
  "guindalera",
  "hispanoamérica",
  "hispanoamerica",
  "castilla",
  "trafalgar",
  "gaztambide",
  "almagro",
  "pacífico",
  "pacifico",
  "delicias",
  "legazpi",
  "chopera",
  "acacias",
  "imperial",
  "sol",
  "huertas",
  "letras",
  "ópera",
  "opera",
  "salesas",
  "eixample",
  "gràcia",
  "gracia",
  "poblenou",
  "born",
  "raval",
  "gótico",
  "gotico",
  "sants",
  "sarrià",
  "sarria",
  "barceloneta",
  "poble sec",
  "poblesec",
  "horta",
  "ciutat vella",
  "sant martí",
  "sant marti",
  "sant andreu",
  "les corts",
  "nou barris",
  "españa",
  "spain",
];

/** Nombres de pila frecuentes. Cuentan en cualquier posición, salvo que estén en la lista permitida. */
export const GIVEN_NAMES = [
  "lucía",
  "lucia",
  "pedro",
  "maría",
  "maria",
  "juan",
  "ana",
  "carlos",
  "laura",
  "javier",
  "sofía",
  "sofia",
  "pablo",
  "elena",
  "diego",
  "marta",
  "alberto",
  "nuria",
  "raúl",
  "raul",
  "sergio",
  "carmen",
  "francisco",
  "antonio",
  "manuel",
  "josé",
  "jose",
  "david",
  "daniel",
  "alejandro",
  "andrea",
  "paula",
  "sara",
  "alba",
  "rocío",
  "rocio",
  "beatriz",
  "cristina",
  "miguel",
  "ángel",
  "angel",
  "fernando",
  "rafael",
  "isabel",
  "patricia",
  "roberto",
  "andrés",
  "andres",
  "jorge",
  "iván",
  "ivan",
  "óscar",
  "oscar",
  "rubén",
  "ruben",
  "silvia",
  "teresa",
  "yolanda",
  "adriana",
  "alicia",
  "álvaro",
  "alvaro",
  "blanca",
  "borja",
  "camila",
  "carla",
  "césar",
  "cesar",
  "claudia",
  "eduardo",
  "enrique",
  "eva",
  "fátima",
  "fatima",
  "gemma",
  "gloria",
  "gonzalo",
  "guillermo",
  "héctor",
  "hector",
  "ignacio",
  "ines",
  "inés",
  "irene",
  "jaime",
  "julia",
  "julio",
  "lorena",
  "luisa",
  "marcos",
  "marina",
  "mario",
  "mónica",
  "monica",
  "natalia",
  "nicolás",
  "nicolas",
  "noelia",
  "olga",
  "paloma",
  "pilar",
  "ramón",
  "ramon",
  "raquel",
  "ricardo",
  "rodrigo",
  "rosa",
  "rosario",
  "samuel",
  "sandra",
  "sonia",
  "susana",
  "tomás",
  "tomas",
  "valeria",
  "verónica",
  "veronica",
  "víctor",
  "victor",
  "virginia",
];

const SKIP_WORDS = [
  "inmobiliaria",
  "agencia",
  "oficina",
  "idealista",
  "fotocasa",
  "google",
  "whatsapp",
  "fachada",
  "lunes",
  "martes",
  "miércoles",
  "miercoles",
  "jueves",
  "viernes",
  "sábado",
  "sabado",
  "domingo",
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
  "calle",
  "plaza",
  "avenida",
  "paseo",
  "camino",
  "glorieta",
  "travesía",
  "travesia",
  "mayor",
  "para",
  "desde",
  "hasta",
  "sobre",
  "entre",
  "según",
  "segun",
  "durante",
  "después",
  "despues",
  "aunque",
  "porque",
  "cuando",
];

export const REFORMULATION_HINT =
  "Si lo envías así, no se publica y lo revisa una persona. Puedes contarlo en hechos: «me cobraron X sin factura», en lugar de «son unos estafadores».";

export type PrefilterCode =
  | "url"
  | "phone"
  | "email"
  | "national_id"
  | "iban"
  | "banned_language"
  | "crime_accusation"
  | "person_name";

export type PrefilterHit = {
  code: PrefilterCode;
  message: string;
};

export type PrefilterResult = {
  outcome: "clean" | "block" | "hold";
  hits: PrefilterHit[];
};

const BLOCK_CODES = new Set<PrefilterCode>([
  "url",
  "phone",
  "email",
  "national_id",
  "iban",
  "banned_language",
]);

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const URL_RE = /\b(?:https?:\/\/|www\.)\S+/gi;
const DOMAIN_RE = /\b[a-z0-9-]+\.(?:com|es|net|org|io|app|eu)\b/gi;
const PHONE_RE = /(?<!\d)(?:\+34|0034)?[\s.-]?[6-9](?:[\s.-]?\d){8}(?!\d)/g;
const INTL_PHONE_RE = /\+\d{1,3}(?:[\s.-]?\d){8,14}/g;
const DNI_RE =
  /(?<![a-z0-9])(?:\d{8}|\d{2}[.\s]\d{3}[.\s]\d{3})[\s.-]?[a-z](?![a-z0-9])/gi;
const NIE_RE =
  /(?<![a-z0-9])[xyz][\s.-]?\d{7}[\s.-]?[a-z](?![a-z0-9])/gi;
const CIF_RE =
  /(?<![a-z0-9])[abcdefghjnpqrsuvw][\s.-]?\d{7}[\s.-]?[0-9a-j](?![a-z0-9])/gi;
const IBAN_RE =
  /(?<![a-z0-9])([a-z]{2}\d{2}(?:[\s-]?[a-z0-9]){11,30})(?![a-z0-9])/gi;
const TITLE_RE =
  /(?:^|[^\p{L}])(?:señora|senora|señor|senor|sra|sr|doña|dona|don|empleados|empleadas|empleado|empleada|comerciales|comercial|gestores|gestoras|gestor|gestora|agentes|agente)[^\p{L}]+(\p{L}[\p{L}'’-]{2,})/giu;

/** Misma lista en el formulario y en el servidor: nombre, razón social, marca y ciudades. */
export function reviewAllowedNames(input: {
  name?: string;
  legalName?: string;
  brandName?: string;
  cities?: Array<string | undefined | null>;
}) {
  return [input.name, input.legalName, input.brandName, ...(input.cities ?? [])].filter(
    (value): value is string => Boolean(value?.trim()),
  );
}

export function screenReviewText(input: {
  title?: string;
  pros?: string;
  cons?: string;
  body?: string;
  publicName?: string;
  agencyName?: string;
  city?: string;
  extraAllowedNames?: string[];
  allowedNames?: string[];
}): PrefilterResult {
  const narrative = [input.title, input.pros, input.cons, input.body]
    .filter(Boolean)
    .join("\n");
  const contact = [narrative, input.publicName].filter(Boolean).join("\n");
  const hits: PrefilterHit[] = [];

  if (hasEmail(contact)) {
    hits.push({
      code: "email",
      message: "Quita el correo electrónico antes de enviar.",
    });
  }
  if (hasUrl(contact)) {
    hits.push({
      code: "url",
      message: "Quita enlaces y direcciones web antes de enviar.",
    });
  }
  if (hasPhone(contact)) {
    hits.push({
      code: "phone",
      message: "Quita el teléfono antes de enviar.",
    });
  }
  if (hasNationalId(contact)) {
    hits.push({
      code: "national_id",
      message: "Quita el DNI, el NIE o el NIF antes de enviar.",
    });
  }
  if (hasIban(contact)) {
    hits.push({
      code: "iban",
      message: "Quita el IBAN o la cuenta bancaria antes de enviar.",
    });
  }

  const banned = matchingTerms(narrative, BANNED_EXPRESSIONS);
  if (banned.length > 0) {
    hits.push({
      code: "banned_language",
      message: "Quita insultos o lenguaje vejatorio antes de enviar.",
    });
  }

  const crimes = matchingTerms(narrative, CRIME_ACCUSATION_TERMS);
  if (crimes.length > 0) {
    hits.push({
      code: "crime_accusation",
      message: `Hay una acusación de delito («${crimes.join("», «")}»). Cuéntalo como hecho, por ejemplo «me cobraron X sin factura», en lugar de «son unos estafadores».`,
    });
  }

  const names = personNames(narrative, allowedTokens(input));
  if (names.length > 0) {
    hits.push({
      code: "person_name",
      message: `Hay un posible nombre de persona («${names.join("», «")}»). No identifiques a empleados; describe el hecho.`,
    });
  }

  if (hits.some((hit) => BLOCK_CODES.has(hit.code))) {
    return { outcome: "block", hits };
  }
  if (hits.length > 0) return { outcome: "hold", hits };
  return { outcome: "clean", hits: [] };
}

function hasEmail(text: string) {
  EMAIL_RE.lastIndex = 0;
  return EMAIL_RE.test(text);
}

function hasUrl(text: string) {
  const withoutEmail = text.replace(EMAIL_RE, " ");
  URL_RE.lastIndex = 0;
  DOMAIN_RE.lastIndex = 0;
  return URL_RE.test(withoutEmail) || DOMAIN_RE.test(withoutEmail);
}

function hasPhone(text: string) {
  PHONE_RE.lastIndex = 0;
  INTL_PHONE_RE.lastIndex = 0;
  return PHONE_RE.test(text) || INTL_PHONE_RE.test(text);
}

function hasNationalId(text: string) {
  DNI_RE.lastIndex = 0;
  NIE_RE.lastIndex = 0;
  CIF_RE.lastIndex = 0;
  return DNI_RE.test(text) || NIE_RE.test(text) || CIF_RE.test(text);
}

function hasIban(text: string) {
  IBAN_RE.lastIndex = 0;
  for (const match of text.matchAll(IBAN_RE)) {
    const compact = match[1]?.replace(/[\s-]/g, "") ?? "";
    if (compact.length >= 15 && compact.length <= 34) return true;
  }
  IBAN_RE.lastIndex = 0;
  return false;
}

function matchingTerms(text: string, terms: readonly string[]) {
  const folded = fold(text);
  const found: string[] = [];
  for (const term of terms) {
    if (containsTerm(folded, fold(term)) && !found.includes(term)) {
      found.push(term);
    }
  }
  return found;
}

function containsTerm(foldedText: string, foldedTerm: string) {
  const escaped = foldedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`,
    "i",
  ).test(foldedText);
}

function personNames(
  text: string,
  allowed: Set<string>,
): string[] {
  const found: string[] = [];
  const push = (word: string) => {
    if (!found.some((item) => fold(item) === fold(word))) found.push(word);
  };

  const skip = new Set(SKIP_WORDS.map(fold));
  for (const match of text.matchAll(TITLE_RE)) {
    const name = match[1];
    if (!name) continue;
    const key = fold(name);
    if (allowed.has(key) || skip.has(key)) continue;
    push(name);
  }

  const given = new Set(GIVEN_NAMES.map(fold));
  for (const match of text.matchAll(/\p{L}{3,}/gu)) {
    const word = match[0];
    const key = fold(word);
    if (given.has(key) && !allowed.has(key)) push(word);
  }
  return found;
}

function allowedTokens(input: {
  agencyName?: string;
  city?: string;
  extraAllowedNames?: string[];
  allowedNames?: string[];
}) {
  const allowed = new Set<string>();
  const sources = [
    ...PLACE_ALLOWLIST,
    input.agencyName ?? "",
    input.city ?? "",
    ...(input.extraAllowedNames ?? []),
    ...(input.allowedNames ?? []),
  ];
  for (const source of sources) {
    for (const token of source.match(/\p{L}{2,}/gu) ?? []) {
      allowed.add(fold(token));
    }
  }
  return allowed;
}

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
