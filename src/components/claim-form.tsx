"use client";

import { FormEvent, useState } from "react";

import { PhoneVerification } from "@/components/phone-verification";

type Step = "verify" | "claim" | "done";

export function ClaimForm({
  agencyId,
  agencyClaimed,
}: {
  agencyId: string;
  agencyClaimed: boolean;
}) {
  const [step, setStep] = useState<Step>("verify");
  const [token, setToken] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("+34");
  const [documentationUrl, setDocumentationUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (agencyClaimed) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
        <h3 className="font-medium text-stone-900">Perfil reclamado</h3>
        <p className="mt-2">
          Esta inmobiliaria ya tiene un perfil verificado.
        </p>
      </div>
    );
  }

  async function submitClaim(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/claims", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        agencyId,
        contactName,
        contactEmail,
        contactPhone,
        documentationUrls: documentationUrl ? [documentationUrl] : [],
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar la reclamación");
      return;
    }

    setStep("done");
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <h3 className="font-medium">Reclamar perfil</h3>
      <p className="mt-1 text-sm text-stone-600">
        Verifica tu teléfono y envía la documentación para gestionar este
        perfil.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "verify" && (
        <div className="mt-4">
          <PhoneVerification
            onVerified={(sessionToken) => {
              setToken(sessionToken);
              setStep("claim");
            }}
          />
        </div>
      )}

      {step === "claim" && (
        <form onSubmit={submitClaim} className="mt-4 space-y-3">
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nombre de contacto"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Email de contacto"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+34600123456"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <input
            value={documentationUrl}
            onChange={(e) => setDocumentationUrl(e.target.value)}
            placeholder="URL de documentación (opcional)"
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <button
            disabled={loading}
            className="w-full rounded-lg bg-stone-900 py-2 font-medium text-white"
          >
            Enviar reclamación
          </button>
        </form>
      )}

      {step === "done" && (
        <p className="mt-4 text-sm text-emerald-700">
          Reclamación enviada. Un administrador la revisará en breve.
        </p>
      )}
    </div>
  );
}
