"use client";

import { FormEvent, useState } from "react";

type Step = "phone" | "code" | "review" | "done";

export function ReviewForm({ agencyId }: { agencyId: string }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+34");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [role, setRole] = useState<"inquilino" | "propietario">("inquilino");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
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
    setToken(data.token);
    setStep("review");
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ agencyId, role, rating, title, body }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo publicar la reseña");
      return;
    }
    setStep("done");
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <h3 className="font-medium">Escribir reseña</h3>
      <p className="mt-1 text-sm text-stone-600">
        Verifica tu teléfono para publicar una opinión verificada.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "phone" && (
        <form onSubmit={requestCode} className="mt-4 space-y-3">
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
        <form onSubmit={verifyCode} className="mt-4 space-y-3">
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

      {step === "review" && (
        <form onSubmit={submitReview} className="mt-4 space-y-3">
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "inquilino" | "propietario")
            }
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          >
            <option value="inquilino">Inquilino</option>
            <option value="propietario">Propietario</option>
          </select>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            maxLength={100}
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Cuéntanos tu experiencia"
            maxLength={1000}
            rows={4}
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <button
            disabled={loading}
            className="w-full rounded-lg bg-amber-700 py-2 font-medium text-white"
          >
            Publicar reseña
          </button>
        </form>
      )}

      {step === "done" && (
        <p className="mt-4 text-sm text-emerald-700">
          ¡Gracias! Tu reseña se ha guardado. Recarga la página para verla.
        </p>
      )}
    </div>
  );
}
