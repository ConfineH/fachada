"use client";

import { FormEvent, useState } from "react";

import type { ContentNoticeCategory } from "@/lib/domain/types";

const CATEGORIES: Array<[ContentNoticeCategory, string]> = [
  ["honor", "Honor o reputación"],
  ["privacy", "Intimidad"],
  ["personal_data", "Datos personales"],
  ["threat", "Amenaza o acoso"],
  ["intellectual_property", "Propiedad intelectual"],
  ["fake_experience", "Experiencia presuntamente falsa"],
  ["other_illegal", "Otro contenido presuntamente ilícito"],
];

export function ReviewReportForm({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] =
    useState<ContentNoticeCategory>("fake_experience");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/content-notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          reporterName: formData.get("reporterName"),
          reporterEmail: formData.get("reporterEmail"),
          relationship: formData.get("relationship") || undefined,
          category,
          exactExcerpt: formData.get("exactExcerpt"),
          legalReason: formData.get("legalReason"),
          evidenceUrl: formData.get("evidenceUrl") || undefined,
          goodFaithAttested: formData.get("goodFaithAttested") === "on",
        }),
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setError(data.error ?? "No se pudo registrar la denuncia.");
        return;
      }
      setReference(data.id);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSending(false);
    }
  }

  if (reference) {
    return (
      <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900">
        Denuncia recibida. Referencia: <strong>{reference}</strong>. Recibirás
        la decisión motivada por email.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="text-xs text-stone-500 underline hover:text-zinc-800"
      >
        Denunciar
      </button>
      {open ? (
        <form
          onSubmit={submit}
          className="mt-3 space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4"
        >
          <p className="text-sm font-semibold text-zinc-900">
            Denunciar contenido presuntamente ilícito
          </p>
          <p className="text-xs text-zinc-600">
            Una valoración negativa no es ilícita por sí sola. Señala el
            fragmento concreto y explica el derecho o norma vulnerados.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="reporterName"
              required
              maxLength={120}
              placeholder="Nombre y apellidos"
              className="input-field"
            />
            <input
              name="reporterEmail"
              type="email"
              required
              placeholder="Email de contacto"
              className="input-field"
            />
          </div>
          <input
            name="relationship"
            maxLength={120}
            placeholder="Relación con el contenido (opcional)"
            className="input-field"
          />
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ContentNoticeCategory)
            }
            className="input-field"
          >
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <textarea
            name="exactExcerpt"
            required
            minLength={3}
            maxLength={500}
            rows={2}
            placeholder="Copia el fragmento exacto"
            className="input-field"
          />
          <textarea
            name="legalReason"
            required
            minLength={20}
            maxLength={2000}
            rows={4}
            placeholder="Explica por qué es ilícito o incumple las normas"
            className="input-field"
          />
          <input
            name="evidenceUrl"
            type="url"
            maxLength={500}
            placeholder="Enlace a evidencia (opcional; evita datos innecesarios)"
            className="input-field"
          />
          <label className="flex items-start gap-2 text-xs text-zinc-700">
            <input
              name="goodFaithAttested"
              type="checkbox"
              required
              className="mt-0.5"
            />
            Declaro de buena fe que la información es exacta y completa.
          </label>
          {error ? <p className="text-xs text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className="btn-primary disabled:opacity-60"
          >
            {sending ? "Enviando…" : "Enviar denuncia"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
