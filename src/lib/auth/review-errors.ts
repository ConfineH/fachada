export const PHONE_SESSION_STORAGE_KEY = "fachada.phoneSessionToken";

export const REVIEW_ERROR_ES: Record<string, string> = {
  "Phone verification required":
    "La verificación del móvil ha caducado. Vuelve a solicitar el código SMS y publica la reseña sin recargar la página.",
};

export function reviewErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Solicitud no válida";
  return REVIEW_ERROR_ES[error.message] ?? error.message;
}
