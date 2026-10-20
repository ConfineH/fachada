"use client";

import { FormEvent, useState } from "react";

import { authHeaders, readSessionToken } from "@/lib/auth/session-client";
import { PUBLIC_NOTICE_REASONS } from "@/lib/domain/content-notice-reasons";
import type { ContentNoticeCategory } from "@/lib/domain/types";

export function ReviewReportForm({
  reviewId,
  label = "Denunciar",
}: {
  reviewId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ContentNoticeCategory>("other");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [codeStatus, setCodeStatus] = useState("");

  async function sendCode() {
    setError("");
    setCodeStatus("");
    if (!email.includes("@")) {
      setError("Escribe el correo para enviarte el código.");
      return;
    }
    setSendingCode(true);
    try {
      const response = await fetch("/api/auth/request-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "No se pudo enviar el código.");
        return;
      }
      setCodeStatus("Te hemos enviado un código a ese correo.");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSendingCode(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const token = readSessionToken();
      const response = await fetch("/api/content-notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? authHeaders(token) : {}),
        },
        body: JSON.stringify({
          reviewId,
          reporterName: formData.get("reporterName"),
          reporterEmail: email,
          emailCode: formData.get("emailCode") || undefined,
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
        setError(data.error ?? "No se pudo registrar el aviso.");
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
        Aviso recibido. Referencia: <strong>{reference}</strong>. Recibirás
        la decisión motivada por correo.
      </p>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="text-xs font-medium text-stone-600 underline hover:text-zinc-900"
      >
        {label}
      </button>
      {open ? (
        <form
          onSubmit={submit}
          className="mt-3 space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4"
        >
          <p className="text-sm font-semibold text-zinc-900">
            {label === "Solicitar revisión"
              ? "Solicitar revisión de esta reseña"
              : "Denunciar esta reseña"}
          </p>
          <p className="text-xs text-zinc-600">
            Una valoración negativa no es ilícita por sí sola. Señala el
            fragmento concreto y explica el derecho o norma vulnerados. Si el
            motivo es datos personales o contenido ofensivo o acusación de
            delito, la reseña se oculta solo si el correo está verificado
            (sesión o código). Sin verificar, el aviso entra en la cola y la
            reseña sigue visible.
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Correo de contacto"
              className="input-field"
            />
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
              <input
                name="emailCode"
                inputMode="numeric"
                maxLength={6}
                placeholder="Código del correo, si no has entrado"
                className="input-field"
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={sendingCode}
                className="btn-secondary min-h-11 shrink-0 disabled:opacity-60"
              >
                {sendingCode ? "Enviando…" : "Enviarme código"}
              </button>
            </div>
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
            {PUBLIC_NOTICE_REASONS.map(([value, reason]) => (
              <option key={value} value={value}>
                {reason}
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
            placeholder="Enlace a pruebas (opcional; evita datos innecesarios)"
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
          {codeStatus ? <p className="text-xs text-emerald-800">{codeStatus}</p> : null}
          {error ? <p className="text-xs text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className="btn-primary disabled:opacity-60"
          >
            {sending ? "Enviando…" : "Enviar aviso"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
