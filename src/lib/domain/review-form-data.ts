/**
 * Shared multipart reader for review publication.
 * JSON and multipart must produce the same fields. The city of the flat
 * lives only here so one route cannot drop it while the other keeps it.
 */
export function formText(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  return typeof value === "string" ? value : undefined;
}

export function reviewMultipartFields(form: FormData) {
  const text = (key: string) => formText(form, key);
  const wouldRecommend = text("wouldRecommend");
  return {
    agencySlug: text("agencySlug"),
    role: text("role"),
    rating: text("rating"),
    narrative: text("narrative"),
    title: text("title"),
    pros: text("pros"),
    cons: text("cons"),
    anonymous: text("anonymous") === "true",
    publicName: text("publicName"),
    wouldRecommend:
      wouldRecommend === undefined || wouldRecommend === "undefined"
        ? undefined
        : wouldRecommend === "true",
    incidentTags: JSON.parse(text("incidentTags") ?? "[]") as unknown,
    incidentSentiments: JSON.parse(text("incidentSentiments") ?? "{}") as unknown,
    experienceDate: text("experienceDate"),
    experienceType: text("experienceType"),
    experienceCity: text("experienceCity"),
    firstHandAttested: text("firstHandAttested") === "true",
    noIncentiveAttested: text("noIncentiveAttested") === "true",
    noConflictAttested: text("noConflictAttested") === "true",
    termsAccepted: text("termsAccepted") === "true",
    termsVersion: text("termsVersion"),
    origen: text("origen"),
  };
}
