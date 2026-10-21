/** Valores de utm_source / utm_campaign aptos para contar y reenviar en la URL. */
export function readUtmValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 64);
}

export function promoQuery(
  utm: { source: string; campaign: string },
  extra?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  if (utm.source) params.set("utm_source", utm.source);
  if (utm.campaign) params.set("utm_campaign", utm.campaign);
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
