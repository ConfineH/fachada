const AUTH_ERROR_ES: Record<string, string> = {
  "No pending verification":
    "No hay un código activo para este móvil. Pulsa «Enviar código SMS» otra vez (si reiniciaste el servidor, el código anterior ya no vale).",
  "Verification code expired":
    "El código ha caducado. Solicita uno nuevo.",
  "Invalid verification code": "Código incorrecto. Revisa los 6 dígitos.",
  "User not found": "Usuario no encontrado. Vuelve a solicitar el código.",
};

export function authErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Solicitud no válida";
  return AUTH_ERROR_ES[error.message] ?? error.message;
}
