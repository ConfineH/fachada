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

function slugFor(name, city) {
  return `${normalize(name)}-${normalize(city)}`
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sqlStr(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const agencyRows = [];
const aliasRows = [];

for (const group of catalog) {
  for (const agency of group.agencies) {
    const slug = slugFor(agency.name, group.city);
    const address = agency.address ?? `Oficina en ${group.city}`;
    const postalCode = agency.postalCode ?? group.postalCode;
    agencyRows.push(
      `  (${sqlStr(slug)}, ${sqlStr(agency.name)}, ${sqlStr(address)}, ${sqlStr(group.city)}, ${sqlStr(postalCode)}, ${sqlStr(agency.website)})`,
    );
    for (const alias of agency.aliases ?? []) {
      aliasRows.push(`  (${sqlStr(slug)}, ${sqlStr(alias)})`);
    }
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
on conflict (slug) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  postal_code = excluded.postal_code,
  website = excluded.website;

insert into agency_name_aliases (agency_id, alias, kind)
select a.id, v.alias, 'commercial'
from (
  values
${aliasRows.join(",\n")}
) as v(slug, alias)
join agencies a on a.slug = v.slug
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
