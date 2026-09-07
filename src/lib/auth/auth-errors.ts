const AUTH_ERROR_ES: Record<string, string> = {
  "No pending verification":
    "No hay un código activo. Pide uno nuevo (si reiniciaste el servidor, el anterior ya no vale).",
  "Verification code expired":
    "El código ha caducado. Solicita uno nuevo.",
  "Invalid verification code": "Código incorrecto. Revisa los 6 dígitos.",
  "User not found": "Usuario no encontrado. Vuelve a solicitar el código.",
  "SMS provider not configured":
    "El envío de SMS no está configurado en este entorno. Prueba más tarde.",
  "Email provider not configured":
    "El envío de email no está configurado. Entra con Google o prueba más tarde.",
  "Invalid Google token":
    "No se pudo entrar con Google. Inténtalo de nuevo.",
  "Verification code recently sent":
    "Espera unos segundos antes de pedir otro código.",
};

export function authErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Solicitud no válida";
  if (error.message.startsWith("Twilio SMS failed")) {
    return "No se pudo enviar el SMS. Revisa el número e inténtalo de nuevo.";
  }
  if (error.message.startsWith("Email send failed")) {
    return "No se pudo enviar el email. Revisa la dirección e inténtalo de nuevo.";
  }
  return AUTH_ERROR_ES[error.message] ?? error.message;
}
