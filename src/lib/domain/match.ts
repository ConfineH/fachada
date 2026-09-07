export function normalizeAgencyName(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchScore(query: string, candidate: string) {
  const q = normalizeAgencyName(query);
  const c = normalizeAgencyName(candidate);
  if (!q || !c) return 0;
  if (q === c) return 1;
  if (c.includes(q) || q.includes(c)) return 0.85;
  const qTokens = new Set(q.split(" ").filter(Boolean));
  const cTokens = c.split(" ").filter(Boolean);
  if (cTokens.length === 0) return 0;
  const overlap = cTokens.filter((t) => qTokens.has(t)).length;
  return overlap / Math.max(qTokens.size, cTokens.length);
}
