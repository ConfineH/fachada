"use client";

import { FormEvent, useState } from "react";

type Step = "phone" | "code";

export function PhoneVerification({
  onVerified,
}: {
  onVerified: (token: string) => void;
}) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+34");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setLoading(true);
    setError("");
    setNotice("");
    setDevCode(null);
    setCode("");

    const res = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al enviar código");
      return false;
    }

    if (typeof data.devCode === "string") {
      setDevCode(data.devCode);
    }
    setStep("code");
    return true;
  }

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    await sendCode();
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const message = data.error ?? "Código inválido";
      if (
        typeof message === "string" &&
        (message.includes("código activo") ||
          message.includes("caducado") ||
          message.includes("reiniciaste"))
      ) {
        setDevCode(null);
        setCode("");
        setStep("phone");
        setError("");
        setNotice(
          "El código anterior ya no vale. Pulsa «Enviar código SMS» para recibir uno nuevo.",
        );
        return;
      }
      setError(message);
      return;
    }

    onVerified(data.token);
  }

  return (
    <div>
      {error && (
        <p className="motion-fade-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {notice && (
        <p className="motion-fade-in rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">
          {notice}
        </p>
      )}

      {step === "phone" && (
        <form
          key="phone"
          onSubmit={requestCode}
          className="motion-scale-in space-y-3"
        >
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+34600123456"
            className="input-field"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full min-h-11"
          >
            Enviar código SMS
          </button>
        </form>
      )}

      {step === "code" && (
        <form key="code" onSubmit={verifyCode} className="motion-scale-in space-y-3">
          <p className="text-sm text-zinc-600">
            Te hemos enviado un SMS a <strong>{phone}</strong>. El código caduca
            en 10 minutos.
          </p>
          {devCode && (
            <p className="motion-fade-in rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Solo en local (sin Twilio): tu código es <strong>{devCode}</strong>
            </p>
          )}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de 6 dígitos"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="input-field"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full min-h-11"
          >
            Verificar
          </button>
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              disabled={loading}
              onClick={() => void sendCode()}
              className="link-brand"
            >
              Reenviar código
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep("phone");
                setDevCode(null);
                setCode("");
                setError("");
                setNotice("");
              }}
              className="text-zinc-600 hover:text-zinc-900"
            >
              Cambiar móvil
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
