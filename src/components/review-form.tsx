"use client";

import { FormEvent, useRef, useState } from "react";

import { AccountVerification } from "@/components/account-verification";
import { SESSION_STORAGE_KEY } from "@/lib/auth/review-errors";
import {
  INCIDENT_TAG_LABELS,
  INCIDENT_TAGS,
  type IncidentTag,
} from "@/lib/domain/incidents";

type Step = "verify" | "review" | "done";

export function ReviewForm({ agencySlug }: { agencySlug: string }) {
  const [step, setStep] = useState<Step>("verify");
  const [token, setToken] = useState("");
  const [role, setRole] = useState<"inquilino" | "propietario">("inquilino");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [incidentTags, setIncidentTags] = useState<IncidentTag[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  function scrollToFeedback() {
    feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function persistToken(sessionToken: string) {
    setToken(sessionToken);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionToken);
    } catch {
      // ignore
    }
    setStep("review");
    setError("");
  }

  function clearSession() {
    setToken("");
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    setStep("verify");
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setError(
        "Identifícate otra vez. Pide un código al email (o entra con Google) y publica sin recargar.",
      );
      clearSession();
      scrollToFeedback();
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle) {
      setError("Añade un título a la reseña.");
      scrollToFeedback();
      return;
    }
    if (trimmedBody.length < 10) {
      setError("El comentario debe tener al menos 10 caracteres.");
      scrollToFeedback();
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("La valoración debe ser entre 1 y 5.");
      scrollToFeedback();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agencySlug,
          role,
          rating,
          title: trimmedTitle,
          body: trimmedBody,
          incidentTags,
        }),
      });

      let data: { error?: string } = {};
      try {
        data = (await res.json()) as { error?: string };
      } catch {
        data = { error: "El servidor no respondió correctamente. Revisa npm run dev." };
      }

      if (!res.ok) {
        const message = data.error ?? "No se pudo publicar la reseña";
        setError(message);
        if (res.status === 401 || message.includes("verificación")) {
          clearSession();
        }
        scrollToFeedback();
        return;
      }

      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
      setStep("done");
      scrollToFeedback();
    } catch {
      setError(
        "No se pudo conectar con el servidor. ¿Sigue abierto npm run dev en localhost:3000?",
      );
      scrollToFeedback();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={feedbackRef}
      className="rounded-xl border border-stone-200 bg-white p-5"
    >
      <h3 className="font-medium">Escribir reseña</h3>
      <p className="mt-1 text-sm text-stone-600">
        Identifícate con Google o un código al email. En la ficha no sale tu
        correo; queda en backend para moderación.
      </p>

      {error && (
        <p className="motion-fade-in mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "verify" && (
        <div key="verify" className="motion-scale-in mt-4">
          <AccountVerification onVerified={persistToken} />
        </div>
      )}

      {step === "review" && (
        <form
          key="review"
          onSubmit={submitReview}
          className="motion-scale-in mt-4 space-y-3"
          noValidate
        >
          <p className="text-xs text-emerald-800">
            Cuenta identificada. Publica ahora, sin recargar la página.
          </p>
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "inquilino" | "propietario")
            }
            className="input-field"
          >
            <option value="inquilino">Inquilino</option>
            <option value="propietario">Propietario</option>
          </select>
          <label className="block text-xs text-zinc-500">
            Valoración (1–5)
            <input
              type="number"
              min={1}
              max={5}
              required
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="input-field mt-1"
            />
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            required
            maxLength={100}
            className="input-field"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Cuéntanos tu experiencia (mín. 10 caracteres)"
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            className="input-field"
          />
          <fieldset>
            <legend className="text-xs font-medium text-zinc-600">
              Incidencias (opcional)
            </legend>
            <p className="mt-1 text-xs text-zinc-500">
              Marca lo que afectó a tu experiencia. Ayuda a comparar agencias.
            </p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {INCIDENT_TAGS.map((tag) => {
                const checked = incidentTags.includes(tag);
                return (
                  <li key={tag}>
                    <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-800">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={checked}
                        onChange={() =>
                          setIncidentTags((current) =>
                            checked
                              ? current.filter((item) => item !== tag)
                              : [...current, tag],
                          )
                        }
                      />
                      {INCIDENT_TAG_LABELS[tag]}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full min-h-11 disabled:opacity-60"
          >
            {loading ? "Publicando…" : "Publicar reseña"}
          </button>
          <button
            type="button"
            onClick={clearSession}
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Usar otra cuenta
          </button>
        </form>
      )}

      {step === "done" && (
        <div
          key="done"
          className="motion-scale-in mt-4 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-900"
        >
          <p className="font-medium">Reseña enviada</p>
          <p className="mt-1">
            La verás en la ficha cuando un moderador la apruebe en{" "}
            <strong>/admin</strong>. Puedes recargar esta página más tarde.
          </p>
        </div>
      )}
    </div>
  );
}
