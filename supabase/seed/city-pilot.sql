-- City catalog (16 agencies). Idempotent by slug.
-- Removes demo agencies created per city. Does not create fake reviews.

delete from agencies
where slug in (
  'inmobiliaria-sol-madrid',
  'gestion-urbana-madrid',
  'pisos-barcelona',
  'inmobiliaria-javier-valencia',
  'fincas-mediterraneo-malaga',
  'gestion-inmobiliaria-central-sevilla'
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
  ('tecnocasa', 'Tecnocasa', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://www.tecnocasa.es'),
  ('donpiso', 'donpiso', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://www.donpiso.com'),
  ('engel-volkers', 'Engel & Völkers', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://www.engelvoelkers.com'),
  ('look-find', 'Look & Find', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://www.lookandfind.es'),
  ('lucas-fox', 'Lucas Fox', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://www.lucasfox.com'),
  ('aproperties', 'Aproperties', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://www.aproperties.es'),
  ('housfy', 'Housfy', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://housfy.com'),
  ('forcadell', 'Forcadell', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://www.forcadell.com'),
  ('alquiler-seguro', 'Alquiler Seguro', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://www.alquilerseguro.es'),
  ('vivendex', 'Vivendex', 'Oficina en Barcelona', 'Barcelona', '08001', 'https://www.vivendex.com'),
  ('re-max', 'RE/MAX', 'Oficina en Valencia', 'Valencia', '46001', 'https://www.remax.es'),
  ('century-21', 'Century 21', 'Oficina en Valencia', 'Valencia', '46001', 'https://www.century21.es'),
  ('alfa-inmobiliaria', 'Alfa Inmobiliaria', 'Oficina en Valencia', 'Valencia', '46001', 'https://www.alfainmo.com'),
  ('redpiso', 'Redpiso', 'Oficina en Valencia', 'Valencia', '46001', 'https://www.redpiso.es'),
  ('gilmar', 'Gilmar', 'Oficina en Málaga', 'Málaga', '29001', 'https://www.gilmar.es'),
  ('iad-espana', 'iad España', 'Oficina en Málaga', 'Málaga', '29001', 'https://www.iadspain.es')
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
  ('Tecnocasa', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('Tecnocasa', 'Oficina en Valencia', 'Valencia', '46001'),
  ('Tecnocasa', 'Oficina en Málaga', 'Málaga', '29001'),
  ('Tecnocasa', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('donpiso', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('donpiso', 'Oficina en Valencia', 'Valencia', '46001'),
  ('donpiso', 'Oficina en Málaga', 'Málaga', '29001'),
  ('donpiso', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('Engel & Völkers', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('Engel & Völkers', 'Oficina en Valencia', 'Valencia', '46001'),
  ('Engel & Völkers', 'Oficina en Málaga', 'Málaga', '29001'),
  ('Engel & Völkers', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('Look & Find', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('Look & Find', 'Oficina en Valencia', 'Valencia', '46001'),
  ('Look & Find', 'Oficina en Málaga', 'Málaga', '29001'),
  ('Look & Find', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('Lucas Fox', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('Lucas Fox', 'Oficina en Málaga', 'Málaga', '29001'),
  ('Aproperties', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('Housfy', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('Housfy', 'Oficina en Valencia', 'Valencia', '46001'),
  ('Housfy', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('Forcadell', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('Alquiler Seguro', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('Alquiler Seguro', 'Oficina en Valencia', 'Valencia', '46001'),
  ('Alquiler Seguro', 'Oficina en Málaga', 'Málaga', '29001'),
  ('Alquiler Seguro', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('Vivendex', 'Oficina en Barcelona', 'Barcelona', '08001'),
  ('RE/MAX', 'Oficina en Valencia', 'Valencia', '46001'),
  ('RE/MAX', 'Oficina en Málaga', 'Málaga', '29001'),
  ('RE/MAX', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('Century 21', 'Oficina en Valencia', 'Valencia', '46001'),
  ('Century 21', 'Oficina en Málaga', 'Málaga', '29001'),
  ('Century 21', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('Alfa Inmobiliaria', 'Oficina en Valencia', 'Valencia', '46001'),
  ('Alfa Inmobiliaria', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('Redpiso', 'Oficina en Valencia', 'Valencia', '46001'),
  ('Redpiso', 'Oficina en Sevilla', 'Sevilla', '41001'),
  ('Gilmar', 'Oficina en Málaga', 'Málaga', '29001'),
  ('iad España', 'Oficina en Málaga', 'Málaga', '29001')
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
  ('Tecnocasa', 'Grupo Tecnocasa'),
  ('Tecnocasa', 'Tecnocasa Barcelona'),
  ('Tecnocasa', 'Tecnocasa España'),
  ('Tecnocasa', 'Tecnocasa Valencia'),
  ('Tecnocasa', 'Tecnocasa Málaga'),
  ('Tecnocasa', 'Tecnocasa Malaga'),
  ('Tecnocasa', 'Tecnocasa Sevilla'),
  ('donpiso', 'Don Piso'),
  ('donpiso', 'Donpiso Barcelona'),
  ('donpiso', 'donpiso Barcelona'),
  ('donpiso', 'Donpiso Valencia'),
  ('donpiso', 'donpiso Valencia'),
  ('donpiso', 'Donpiso Málaga'),
  ('donpiso', 'donpiso Malaga'),
  ('donpiso', 'Donpiso Sevilla'),
  ('donpiso', 'donpiso Sevilla'),
  ('Engel & Völkers', 'Engel and Volkers'),
  ('Engel & Völkers', 'Engel Voelkers'),
  ('Engel & Völkers', 'Engel & Volkers Barcelona'),
  ('Engel & Völkers', 'E&V'),
  ('Engel & Völkers', 'Engel & Volkers Valencia'),
  ('Engel & Völkers', 'Engel & Volkers Málaga'),
  ('Engel & Völkers', 'Engel & Volkers Sevilla'),
  ('Look & Find', 'Look and Find'),
  ('Look & Find', 'Look&Find'),
  ('Look & Find', 'Look & Find Barcelona'),
  ('Look & Find', 'Look & Find Valencia'),
  ('Look & Find', 'Look & Find Málaga'),
  ('Look & Find', 'Look & Find Sevilla'),
  ('Lucas Fox', 'Lucas Fox Barcelona'),
  ('Lucas Fox', 'LucasFox'),
  ('Lucas Fox', 'Lucas Fox Málaga'),
  ('Lucas Fox', 'Lucas Fox Marbella'),
  ('Aproperties', 'A Properties'),
  ('Aproperties', 'Aproperties Barcelona'),
  ('Housfy', 'Housfy Alquiler'),
  ('Housfy', 'Housfy Barcelona'),
  ('Housfy', 'Housfy Valencia'),
  ('Housfy', 'Housfy Sevilla'),
  ('Forcadell', 'Forcadell Barcelona'),
  ('Forcadell', 'Inmobiliaria Forcadell'),
  ('Alquiler Seguro', 'AlquilerSeguro'),
  ('Alquiler Seguro', 'Alquiler Seguro S.A.'),
  ('Alquiler Seguro', 'Alquiler Seguro Barcelona'),
  ('Alquiler Seguro', 'Alquiler Seguro Valencia'),
  ('Alquiler Seguro', 'Alquiler Seguro Málaga'),
  ('Alquiler Seguro', 'Alquiler Seguro Sevilla'),
  ('Vivendex', 'Vivendex Barcelona'),
  ('Vivendex', 'Inmobiliaria Vivendex'),
  ('RE/MAX', 'Remax'),
  ('RE/MAX', 'REMAX'),
  ('RE/MAX', 'RE/MAX Valencia'),
  ('RE/MAX', 'RE/MAX Málaga'),
  ('RE/MAX', 'RE/MAX Malaga'),
  ('RE/MAX', 'RE/MAX Sevilla'),
  ('Century 21', 'Century21'),
  ('Century 21', 'C21'),
  ('Century 21', 'Century 21 Valencia'),
  ('Century 21', 'Century 21 Málaga'),
  ('Century 21', 'Century 21 Sevilla'),
  ('Alfa Inmobiliaria', 'Alfa Inmo'),
  ('Alfa Inmobiliaria', 'Alfa Inmobiliaria Valencia'),
  ('Alfa Inmobiliaria', 'Alfa Inmobiliaria Sevilla'),
  ('Redpiso', 'Red Piso'),
  ('Redpiso', 'Redpiso Valencia'),
  ('Redpiso', 'Redpiso Sevilla'),
  ('Gilmar', 'Gilmar Málaga'),
  ('Gilmar', 'Gilmar Marbella'),
  ('Gilmar', 'Inmobiliaria Gilmar'),
  ('iad España', 'iad'),
  ('iad España', 'IAD'),
  ('iad España', 'iad Spain'),
  ('iad España', 'iad Málaga')
) as v(name, alias)
join agencies a on lower(btrim(a.name)) = lower(btrim(v.name))
where not exists (
  select 1
  from agency_name_aliases existing
  where existing.agency_id = a.id
    and lower(existing.alias) = lower(v.alias)
);
