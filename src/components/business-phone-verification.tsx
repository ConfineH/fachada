"use client";

import { FormEvent, useState } from "react";

type Step = "intro" | "code";

export function BusinessPhoneVerification({
  agencyId,
  agencyPhoneHint,
  sessionToken,
  onVerified,
}: {
  agencyId: string;
  agencyPhoneHint: string;
  sessionToken: string;
  onVerified: () => void;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [phoneHint, setPhoneHint] = useState(agencyPhoneHint);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode() {
    setLoading(true);
    setError("");
    setDevCode(null);

    const res = await fetch("/api/claims/business-phone/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ agencyId }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar el código");
      return;
    }

    if (typeof data.phoneHint === "string") setPhoneHint(data.phoneHint);
    if (typeof data.devCode === "string") setDevCode(data.devCode);
    setStep("code");
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/claims/business-phone/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ agencyId, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Código inválido");
      return;
    }

    onVerified();
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
      <p className="text-sm font-medium text-stone-900">
        Paso 2 — Teléfono de la inmobiliaria (como Google Business)
      </p>
      <p className="mt-1 text-sm text-stone-600">
        Enviaremos un código al teléfono publicado en esta ficha ({phoneHint}).
        Solo quien tenga acceso a esa línea puede continuar.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "intro" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => void requestCode()}
          className="mt-4 w-full rounded-lg bg-amber-800 py-2 text-sm font-medium text-white"
        >
          Enviar código al teléfono de la agencia
        </button>
      )}

      {step === "code" && (
        <form onSubmit={verifyCode} className="mt-4 space-y-3">
          {devCode && (
            <p className="rounded-lg bg-white px-3 py-2 text-sm text-amber-900">
              Solo en local (sin Twilio): código{" "}
              <strong>{devCode}</strong>
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
            className="w-full rounded-lg bg-amber-800 py-2 text-sm font-medium text-white"
          >
            Confirmar acceso a la línea
          </button>
        </form>
      )}
    </div>
  );
}
