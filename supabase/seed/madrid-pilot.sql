-- Madrid pilot catalog (25 agencies). Idempotent by slug.
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
  ('alquiler-seguro-madrid', 'Alquiler Seguro', 'Oficina en Madrid', '28001', 'https://www.alquilerseguro.es'),
  ('housfy-madrid', 'Housfy', 'Oficina en Madrid', '28001', 'https://housfy.com'),
  ('tecnocasa-madrid', 'Tecnocasa', 'Oficina en Madrid', '28001', 'https://www.tecnocasa.es'),
  ('look-find-madrid', 'Look & Find', 'Oficina en Madrid', '28001', 'https://www.lookandfind.es'),
  ('gilmar-madrid', 'Gilmar', 'Oficina en Madrid', '28001', 'https://www.gilmar.es'),
  ('engel-volkers-madrid', 'Engel & Völkers', 'Oficina en Madrid', '28001', 'https://www.engelvoelkers.com'),
  ('lucas-fox-madrid', 'Lucas Fox', 'Oficina en Madrid', '28001', 'https://www.lucasfox.com'),
  ('donpiso-madrid', 'donpiso', 'Calle de Castelló 55', '28001', 'https://www.donpiso.com'),
  ('re-max-madrid', 'RE/MAX', 'Oficina en Madrid', '28001', 'https://www.remax.es'),
  ('century-21-madrid', 'Century 21', 'Oficina en Madrid', '28001', 'https://www.century21.es'),
  ('alfa-inmobiliaria-madrid', 'Alfa Inmobiliaria', 'Calle de Palos de la Frontera 4', '28012', 'https://www.alfainmo.com'),
  ('redpiso-madrid', 'Redpiso', 'Calle Eduardo Galeano 2, Rivas Vaciamadrid', '28521', 'https://www.redpiso.es'),
  ('iad-espana-madrid', 'iad España', 'Oficina en Madrid', '28001', 'https://www.iadspain.es'),
  ('comprarcasa-madrid', 'Comprarcasa', 'Oficina en Madrid', '28001', 'https://www.comprarcasa.com'),
  ('aproperties-madrid', 'Aproperties', 'Oficina en Madrid', '28001', 'https://www.aproperties.es'),
  ('knight-frank-madrid', 'Knight Frank', 'Oficina en Madrid', '28001', 'https://www.knightfrank.es'),
  ('savills-madrid', 'Savills', 'Oficina en Madrid', '28001', 'https://www.savills.es'),
  ('forcadell-madrid', 'Forcadell', 'Oficina en Madrid', '28001', 'https://www.forcadell.com'),
  ('sotheby-s-international-realty-madrid', 'Sotheby''s International Realty', 'Oficina en Madrid', '28001', 'https://www.sothebysrealty.com'),
  ('barnes-madrid', 'Barnes', 'Oficina en Madrid', '28001', 'https://www.barnes-madrid.com'),
  ('keller-williams-madrid', 'Keller Williams', 'Oficina en Madrid', '28001', 'https://www.kwspain.com'),
  ('coldwell-banker-madrid', 'Coldwell Banker', 'Oficina en Madrid', '28001', 'https://www.coldwellbanker.es'),
  ('madrid-easy-madrid', 'Madrid Easy', 'Oficina en Madrid', '28001', 'https://www.madrideasy.com'),
  ('era-inmobiliaria-madrid', 'ERA Inmobiliaria', 'Oficina en Madrid', '28001', 'https://www.era.es'),
  ('winkworth-madrid', 'Winkworth', 'Oficina en Madrid', '28001', 'https://www.winkworth.es')
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
  ('alquiler-seguro-madrid', 'AlquilerSeguro'),
  ('alquiler-seguro-madrid', 'Alquiler Seguro S.A.'),
  ('alquiler-seguro-madrid', 'Alquiler Seguro SA'),
  ('housfy-madrid', 'Housfy Alquiler'),
  ('housfy-madrid', 'Housfy Madrid'),
  ('tecnocasa-madrid', 'Grupo Tecnocasa'),
  ('tecnocasa-madrid', 'Tecnocasa Madrid'),
  ('tecnocasa-madrid', 'Tecnocasa España'),
  ('look-find-madrid', 'Look and Find'),
  ('look-find-madrid', 'Look&Find'),
  ('look-find-madrid', 'Look & Find Chamberí'),
  ('look-find-madrid', 'Look & Find Pacífico'),
  ('gilmar-madrid', 'Gilmar Madrid'),
  ('gilmar-madrid', 'Inmobiliaria Gilmar'),
  ('engel-volkers-madrid', 'Engel and Volkers'),
  ('engel-volkers-madrid', 'Engel Voelkers'),
  ('engel-volkers-madrid', 'Engel & Volkers Madrid'),
  ('engel-volkers-madrid', 'E&V'),
  ('lucas-fox-madrid', 'Lucas Fox Madrid'),
  ('lucas-fox-madrid', 'LucasFox'),
  ('donpiso-madrid', 'Don Piso'),
  ('donpiso-madrid', 'Donpiso Madrid'),
  ('donpiso-madrid', 'donpiso Madrid'),
  ('re-max-madrid', 'Remax'),
  ('re-max-madrid', 'REMAX'),
  ('re-max-madrid', 'RE/MAX Madrid'),
  ('century-21-madrid', 'Century21'),
  ('century-21-madrid', 'C21'),
  ('century-21-madrid', 'Century 21 Madrid'),
  ('alfa-inmobiliaria-madrid', 'Alfa Inmo'),
  ('alfa-inmobiliaria-madrid', 'Alfa Inmobiliaria Madrid'),
  ('redpiso-madrid', 'Red Piso'),
  ('redpiso-madrid', 'Redpiso Madrid'),
  ('iad-espana-madrid', 'iad'),
  ('iad-espana-madrid', 'IAD'),
  ('iad-espana-madrid', 'iad Spain'),
  ('comprarcasa-madrid', 'Comprar Casa'),
  ('comprarcasa-madrid', 'Comprarcasa Madrid'),
  ('aproperties-madrid', 'A Properties'),
  ('aproperties-madrid', 'Aproperties Madrid'),
  ('knight-frank-madrid', 'Knight Frank Madrid'),
  ('knight-frank-madrid', 'KnightFrank'),
  ('savills-madrid', 'Savills Madrid'),
  ('savills-madrid', 'Savills Aguirre Newman'),
  ('forcadell-madrid', 'Forcadell Madrid'),
  ('forcadell-madrid', 'Inmobiliaria Forcadell'),
  ('sotheby-s-international-realty-madrid', 'Sothebys'),
  ('sotheby-s-international-realty-madrid', 'Sotheby''s'),
  ('sotheby-s-international-realty-madrid', 'Sotheby''s Realty Madrid'),
  ('barnes-madrid', 'Barnes Madrid'),
  ('barnes-madrid', 'BARNES'),
  ('keller-williams-madrid', 'KW'),
  ('keller-williams-madrid', 'Keller Williams Madrid'),
  ('keller-williams-madrid', 'KW Spain'),
  ('coldwell-banker-madrid', 'Coldwell Banker Madrid'),
  ('coldwell-banker-madrid', 'CB Inmobiliaria'),
  ('madrid-easy-madrid', 'MadridEasy'),
  ('madrid-easy-madrid', 'Madrid Easy Rentals'),
  ('era-inmobiliaria-madrid', 'ERA'),
  ('era-inmobiliaria-madrid', 'ERA Madrid'),
  ('winkworth-madrid', 'Winkworth Madrid'),
  ('winkworth-madrid', 'Winkworth Spain')
) as v(slug, alias)
join agencies a on a.slug = v.slug
where not exists (
  select 1
  from agency_name_aliases existing
  where existing.agency_id = a.id
    and lower(existing.alias) = lower(v.alias)
);
