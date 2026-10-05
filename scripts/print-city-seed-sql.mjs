import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  readFileSync(join(root, "data/city-pilot-agencies.json"), "utf8"),
);

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugForName(name) {
  return normalize(name).replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function sqlStr(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const companies = new Map();

for (const group of catalog) {
  for (const agency of group.agencies) {
    const key = normalize(agency.name);
    const current = companies.get(key) ?? {
      name: agency.name,
      website: agency.website,
      aliases: new Set(),
      places: [],
    };
    current.places.push({
      city: group.city,
      postalCode: agency.postalCode ?? group.postalCode,
      address: agency.address ?? `Oficina en ${group.city}`,
    });
    for (const alias of agency.aliases ?? []) current.aliases.add(alias);
    companies.set(key, current);
  }
}

const agencyRows = [];
const locationRows = [];
const aliasRows = [];

for (const company of companies.values()) {
  const principal = company.places[0];
  agencyRows.push(
    `  (${sqlStr(slugForName(company.name))}, ${sqlStr(company.name)}, ${sqlStr(principal.address)}, ${sqlStr(principal.city)}, ${sqlStr(principal.postalCode)}, ${sqlStr(company.website)})`,
  );
  for (const place of company.places) {
    locationRows.push(
      `  (${sqlStr(company.name)}, ${sqlStr(place.address)}, ${sqlStr(place.city)}, ${sqlStr(place.postalCode)})`,
    );
  }
  for (const alias of company.aliases) {
    aliasRows.push(`  (${sqlStr(company.name)}, ${sqlStr(alias)})`);
  }
}

const fakeSlugs = [
  "inmobiliaria-sol-madrid",
  "gestion-urbana-madrid",
  "pisos-barcelona",
  "inmobiliaria-javier-valencia",
  "fincas-mediterraneo-malaga",
  "gestion-inmobiliaria-central-sevilla",
];

const sql = `-- City catalog (${agencyRows.length} agencies). Idempotent by slug.
-- Removes demo agencies created per city. Does not create fake reviews.

delete from agencies
where slug in (
  ${fakeSlugs.map(sqlStr).join(",\n  ")}
);

insert into agencies (
  slug, name, address, city, postal_code, phone, phone_published, email, website,
  claimed, verified, premium
)
select
  v.slug,
  v.name,
  v.address,
  v.city,
  v.postal_code,
  '',
  false,
  '',
  v.website,
  false,
  false,
  false
from (
  values
${agencyRows.join(",\n")}
) as v(slug, name, address, city, postal_code, website)
where not exists (
  select 1 from agencies existing
  where lower(btrim(existing.name)) = lower(btrim(v.name))
)
on conflict (slug) do nothing;

insert into agency_locations (agency_id, kind, status, address, city, postal_code)
select a.id, 'branch', 'publicado', v.address, v.city, v.postal_code
from (
  values
${locationRows.length ? locationRows.join(",\n") : "  ('__none__', '', '', '')"}
) as v(name, address, city, postal_code)
join agencies a on lower(btrim(a.name)) = lower(btrim(v.name))
where v.name <> '__none__'
  and not (
    lower(btrim(a.city)) = lower(btrim(v.city))
    and lower(btrim(a.address)) = lower(btrim(v.address))
  )
  and not exists (
    select 1 from agency_locations l
    where l.agency_id = a.id
      and lower(btrim(l.city)) = lower(btrim(v.city))
      and lower(btrim(l.address)) = lower(btrim(v.address))
  );

insert into agency_name_aliases (agency_id, alias, kind)
select a.id, v.alias, 'commercial'
from (
  values
${aliasRows.join(",\n")}
) as v(name, alias)
join agencies a on lower(btrim(a.name)) = lower(btrim(v.name))
where not exists (
  select 1
  from agency_name_aliases existing
  where existing.agency_id = a.id
    and lower(existing.alias) = lower(v.alias)
);
`;

const outDir = join(root, "supabase/seed");
mkdirSync(outDir, { recursive: true });
const out = join(outDir, "city-pilot.sql");
writeFileSync(out, sql);
console.log(
  `Wrote ${out} (${agencyRows.length} agencies, ${aliasRows.length} aliases, ${fakeSlugs.length} demo deletes)`,
);
