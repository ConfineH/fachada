export function composeReviewBody(pros: string, cons: string) {
  return `Ventajas: ${pros.trim()}\n\nDesventajas: ${cons.trim()}`;
}

export function reviewProsCons(review: {
  pros?: string;
  cons?: string;
  body: string;
}): { pros?: string; cons?: string; body?: string } {
  const pros = review.pros?.trim();
  const cons = review.cons?.trim();
  if (pros && cons) return { pros, cons };
  const match = review.body.match(
    /^Ventajas:\s*([\s\S]*?)\n\nDesventajas:\s*([\s\S]*)$/i,
  );
  if (match?.[1]?.trim() && match[2]?.trim()) {
    return { pros: match[1].trim(), cons: match[2].trim() };
  }
  return { body: review.body };
}

export function reviewPublicByline(review: {
  anonymous: boolean;
  publicName?: string;
  role: "inquilino" | "propietario";
}) {
  const role = review.role === "inquilino" ? "Inquilino" : "Propietario";
  if (review.anonymous || !review.publicName?.trim()) return role;
  return `${review.publicName.trim()} · ${role}`;
}
