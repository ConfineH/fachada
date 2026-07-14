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
  const [loading, setLoading] = useState(false);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setDevCode(null);

    const res = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al enviar código");
      return;
    }

    if (typeof data.devCode === "string") {
      setDevCode(data.devCode);
    }
    setStep("code");
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
      setError(data.error ?? "Código inválido");
      return;
    }

    onVerified(data.token);
  }

  return (
    <div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "phone" && (
        <form onSubmit={requestCode} className="space-y-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+34600123456"
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <button
            disabled={loading}
            className="w-full rounded-lg bg-amber-700 py-2 font-medium text-white"
          >
            Enviar código SMS
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verifyCode} className="space-y-3">
          {devCode && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Modo desarrollo: tu código es <strong>{devCode}</strong>
            </p>
          )}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de 6 dígitos"
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <button
            disabled={loading}
            className="w-full rounded-lg bg-amber-700 py-2 font-medium text-white"
          >
            Verificar
          </button>
        </form>
      )}
    </div>
  );
}
