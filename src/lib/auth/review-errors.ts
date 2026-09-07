export const SESSION_STORAGE_KEY = "fachada.sessionToken";
/** @deprecated Use SESSION_STORAGE_KEY */
export const PHONE_SESSION_STORAGE_KEY = SESSION_STORAGE_KEY;

const ACCOUNT_EXPIRED =
  "La sesión ha caducado. Vuelve a identificarte y publica sin recargar la página.";

export const REVIEW_ERROR_ES: Record<string, string> = {
  "Account verification required": ACCOUNT_EXPIRED,
  "Phone verification required": ACCOUNT_EXPIRED,
};

export function reviewErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Solicitud no válida";
  return REVIEW_ERROR_ES[error.message] ?? error.message;
}
