import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  readFileSync(join(root, "data/madrid-pilot-agencies.json"), "utf8"),
);

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugFor(name) {
  return `${normalize(name)}-madrid`.replace(/\s+/g, "-").replace(/-+/g, "-");
}

function sqlStr(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const agencyRows = catalog.map((agency) => {
  const slug = slugFor(agency.name);
  return `  (${sqlStr(slug)}, ${sqlStr(agency.name)}, ${sqlStr(agency.address)}, ${sqlStr(agency.postalCode)}, ${sqlStr(agency.website)})`;
});

const aliasRows = catalog.flatMap((agency) =>
  (agency.aliases ?? []).map(
    (alias) => `  (${sqlStr(slugFor(agency.name))}, ${sqlStr(alias)})`,
  ),
);

const sql = `-- Madrid pilot catalog (${catalog.length} agencies). Idempotent by slug.
-- Apply in Supabase SQL editor (project Fachada). Does not create fake reviews.

insert into agencies (
  slug, name, address, city, postal_code, phone, phone_published, email, website,
  claimed, verified, premium
)
select
  v.slug,
  v.name,
  v.address,
  'Madrid',
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
) as v(slug, name, address, postal_code, website)
on conflict (slug) do update set
  name = excluded.name,
  address = excluded.address,
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
const out = join(outDir, "madrid-pilot.sql");
writeFileSync(out, sql);
console.log(`Wrote ${out} (${catalog.length} agencies, ${aliasRows.length} aliases)`);
