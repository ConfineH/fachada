"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { AccountVerification } from "@/components/account-verification";
import { IncidentMarkFields } from "@/components/incident-mark-fields";
import {
  clearSessionToken,
  readSessionToken,
  writeSessionToken,
} from "@/lib/auth/session-client";
import {
  sentimentsFromMarks,
  tagsFromSentiments,
  unsetMarkMessage,
  type IncidentMarks,
} from "@/lib/domain/incidents";
import {
  EVIDENCE_TOO_LARGE_ERROR,
  prepareEvidenceFile,
} from "@/lib/review-evidence-file";
import { publicApiUrl } from "@/lib/site-url";
import {
  REVIEW_TERMS_VERSION,
  WHOLE_NUMBER_RATING_ERROR,
} from "@/lib/domain/review-authenticity";
import type { ReviewExperienceType } from "@/lib/domain/types";

type Step = "verify" | "review" | "done";

export function ReviewForm({
  agencySlug,
  cities = [],
}: {
  agencySlug: string;
  cities?: string[];
}) {
  const [step, setStep] = useState<Step>("verify");
  const [token, setToken] = useState("");
  const [role, setRole] = useState<"inquilino" | "propietario">("inquilino");
  const [rating, setRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [publicName, setPublicName] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<"yes" | "no" | "skip">(
    "skip",
  );
  const [experienceDate, setExperienceDate] = useState("");
  const [experienceType, setExperienceType] =
    useState<ReviewExperienceType>("alquiler");
  const [experienceCity, setExperienceCity] = useState(cities[0] ?? "");
  const [firstHandAttested, setFirstHandAttested] = useState(false);
  const [noIncentiveAttested, setNoIncentiveAttested] = useState(false);
  const [noConflictAttested, setNoConflictAttested] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [marks, setMarks] = useState<IncidentMarks>({});
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<
    | "date"
    | "city"
    | "rating"
    | "title"
    | "pros"
    | "cons"
    | "name"
    | "themes"
    | "declarations"
    | "form"
    | ""
  >("");
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(true);
  const [holdReason, setHoldReason] = useState("");
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readSessionToken();
    if (stored) {
      setToken(stored);
      setStep("review");
    }
  }, []);

  function showError(
    field:
      | "date"
      | "city"
      | "rating"
      | "title"
      | "pros"
      | "cons"
      | "name"
      | "themes"
      | "declarations"
      | "form",
    message: string,
  ) {
    setError(message);
    setErrorField(field);
    requestAnimationFrame(() => {
      document
        .getElementById(field === "form" ? "review-form-error" : `review-${field}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function persistToken(sessionToken: string) {
    setToken(sessionToken);
    writeSessionToken(sessionToken);
    setStep("review");
    setError("");
    setErrorField("");
  }

  function clearSession() {
    setToken("");
    clearSessionToken();
    setStep("verify");
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      showError(
        "form",
        "Identifícate otra vez. Pide un código al correo (o entra con Google) y publica sin recargar.",
      );
      clearSession();
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedPros = pros.trim();
    const trimmedCons = cons.trim();
    if (!experienceDate) {
      showError("date", "Indica la fecha de tu última interacción.");
      return;
    }
    if (experienceCity.trim().length < 2) {
      showError("city", "Indica la ciudad del piso.");
      return;
    }
    if (rating === null) {
      showError("rating", "Elige una nota del 1 al 5.");
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      showError("rating", WHOLE_NUMBER_RATING_ERROR);
      return;
    }
    if (!trimmedTitle) {
      showError("title", "Añade un título a la reseña.");
      return;
    }
    if (trimmedCons.length < 10) {
      showError("cons", "Las desventajas deben tener al menos 10 caracteres.");
      return;
    }
    if (trimmedPros.length < 10) {
      showError("pros", "Las ventajas deben tener al menos 10 caracteres.");
      return;
    }
    if (!anonymous && !publicName.trim()) {
      showError("name", "Indica un nombre público o publica de forma anónima.");
      return;
    }
    const unsetTheme = unsetMarkMessage(marks);
    if (unsetTheme) {
      showError("themes", unsetTheme);
      return;
    }
    if (
      !firstHandAttested ||
      !noIncentiveAttested ||
      !noConflictAttested ||
      !termsAccepted
    ) {
      showError(
        "declarations",
        "Confirma las declaraciones de autenticidad y las normas.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setErrorField("");
    setEvidenceNote("");
    const sentiments = sentimentsFromMarks(marks);
    const payload = {
      agencySlug,
      role,
      rating,
      title: trimmedTitle,
      pros: trimmedPros,
      cons: trimmedCons,
      anonymous,
      publicName: anonymous ? "" : publicName.trim(),
      wouldRecommend:
        wouldRecommend === "skip" ? undefined : wouldRecommend === "yes",
      incidentTags: tagsFromSentiments(sentiments),
      incidentSentiments: sentiments,
      experienceDate,
      experienceType,
      experienceCity,
      firstHandAttested,
      noIncentiveAttested,
      noConflictAttested,
      termsAccepted,
      termsVersion: REVIEW_TERMS_VERSION,
    };
    try {
      let fileToSend: File | null = null;
      let droppedEvidence = false;
      if (evidence) {
        try {
          fileToSend = await prepareEvidenceFile(evidence);
        } catch {
          fileToSend = null;
          droppedEvidence = true;
        }
      }

      const send = (file: File | null) => {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
        };
        let body: BodyInit;
        if (file) {
          const formData = new FormData();
          for (const [key, value] of Object.entries(payload)) {
            if (value === undefined) continue;
            formData.set(
              key,
              typeof value === "string" ? value : JSON.stringify(value),
            );
          }
          formData.set("evidence", file);
          body = formData;
        } else {
          headers["Content-Type"] = "application/json";
          body = JSON.stringify(payload);
        }
        return fetch(publicApiUrl("/api/reviews"), {
          method: "POST",
          headers,
          body,
        });
      };

      let res = await send(fileToSend);
      let raw = await res.text();
      const rejectedForSize =
        res.status === 413 ||
        raw.includes("PAYLOAD_TOO_LARGE") ||
        raw.includes("más de 3 MB");
      if (fileToSend && rejectedForSize) {
        droppedEvidence = true;
        res = await send(null);
        raw = await res.text();
      }
      let data: {
        error?: string;
        review?: { moderated?: boolean; moderationReason?: string };
      } = {};
      try {
        data = raw
          ? (JSON.parse(raw) as {
              error?: string;
              review?: { moderated?: boolean; moderationReason?: string };
            })
          : {};
      } catch {
        const tooLarge = res.status === 413 || raw.includes("PAYLOAD_TOO_LARGE");
        data = {
          error: tooLarge
            ? evidence
              ? EVIDENCE_TOO_LARGE_ERROR
              : "No se ha publicado la reseña: el servidor ha rechazado el tamaño del envío."
            : window.location.hostname === "localhost"
              ? "El servidor no respondió correctamente. Revisa npm run dev."
              : res.status >= 300 && res.status < 400
                ? "No se ha publicado la reseña porque el dominio ha redirigido la petición. Recarga la página e inténtalo."
                : `No se ha publicado la reseña. El servidor respondió ${res.status}.`,
        };
      }

      if (!res.ok) {
        const message = data.error ?? "No se pudo publicar la reseña";
        showError("form", message);
        if (res.status === 401 || message.includes("verificación")) {
          clearSession();
        }
        return;
      }

      if (droppedEvidence) {
        setEvidenceNote(
          "La reseña se ha publicado sin el archivo. Sube una foto de una página, no el contrato entero.",
        );
      }
      const isPublic = data.review?.moderated !== false;
      setPublished(isPublic);
      setHoldReason(
        isPublic
          ? ""
          : (data.review?.moderationReason ??
            "Una persona la revisará antes de que salga en la ficha."),
      );
      setStep("done");
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      showError(
        "form",
        window.location.hostname === "localhost"
          ? "No se pudo conectar con el servidor. ¿Sigue abierto npm run dev en localhost:3000?"
          : "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      );
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
        Identifícate con Google o un código al correo. En la ficha no sale tu
        correo; queda en nuestros registros para moderación.
      </p>

      {error && (
        <p
          id="review-form-error"
          className="motion-fade-in mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {step === "verify" && (
        <div key="verify" className="motion-scale-in mt-4">
          <AccountVerification
            onVerified={persistToken}
            purpose="para publicar la reseña"
          />
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
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-zinc-900">
              Tu experiencia
            </legend>
          <label className="block text-xs font-medium text-zinc-600">
            Tu papel
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "inquilino" | "propietario")
              }
              className="input-field mt-1"
            >
              <option value="inquilino">Inquilino</option>
              <option value="propietario">Propietario</option>
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label id="review-date" className="block text-xs font-medium text-zinc-600">
              Último contacto
              <input
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                value={experienceDate}
                aria-invalid={errorField === "date"}
                aria-describedby={errorField === "date" ? "review-date-error" : undefined}
                onChange={(event) => setExperienceDate(event.target.value)}
                className="input-field mt-1"
              />
              {errorField === "date" && error ? (
                <span id="review-date-error" className="mt-1 block text-sm font-normal text-red-700">
                  {error}
                </span>
              ) : null}
            </label>
            <label className="block text-xs font-medium text-zinc-600">
              Tipo de experiencia
              <select
                value={experienceType}
                onChange={(event) =>
                  setExperienceType(
                    event.target.value as ReviewExperienceType,
                  )
                }
                className="input-field mt-1"
              >
                <option value="visita">Visita o contacto sustancial</option>
                <option value="negociacion">Negociación o reserva</option>
                <option value="alquiler">Alquiler</option>
                <option value="incidencia">Incidencia o reparación</option>
                <option value="gestion">Encargo de gestión</option>
              </select>
            </label>
          </div>
          <label id="review-city" className="block text-xs font-medium text-zinc-600">
            ¿En qué ciudad está el piso?
            <input
              required
              list="review-cities"
              value={experienceCity}
              aria-invalid={errorField === "city"}
              onChange={(event) => setExperienceCity(event.target.value)}
              className="input-field mt-1"
              placeholder="Madrid"
            />
            <datalist id="review-cities">
              {cities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
            <span className="mt-1 block font-normal text-zinc-500">
              Si solo fuiste a una oficina, indica la ciudad de esa oficina.
            </span>
            {errorField === "city" && error ? (
              <span className="mt-1 block text-sm font-normal text-red-700">
                {error}
              </span>
            ) : null}
          </label>
          <p className="text-xs text-zinc-500">
            La fecha debe ser de los últimos 30 días. Si sigues de alquiler o
            de gestión, indica el último contacto que importe.
          </p>
          <label id="review-rating" className="block text-xs font-medium text-zinc-600">
            Nota (1–5)
            <input
              type="number"
              min={1}
              max={5}
              step={1}
              required
              value={rating ?? ""}
              aria-invalid={errorField === "rating"}
              aria-describedby={errorField === "rating" ? "review-rating-error" : undefined}
              onChange={(e) => {
                const next = e.target.value;
                setRating(next === "" ? null : Number(next));
              }}
              className="input-field mt-1"
            />
            {errorField === "rating" && error ? (
              <span id="review-rating-error" className="mt-1 block text-sm font-normal text-red-700">
                {error}
              </span>
            ) : null}
          </label>
          <label id="review-title" className="block text-xs font-medium text-zinc-600">
            Título
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. La fianza tardó semanas en volver"
              required
              maxLength={100}
              aria-invalid={errorField === "title"}
              aria-describedby={errorField === "title" ? "review-title-error" : undefined}
              className="input-field mt-1"
            />
            {errorField === "title" && error ? (
              <span id="review-title-error" className="mt-1 block text-sm font-normal text-red-700">
                {error}
              </span>
            ) : null}
          </label>
          <label id="review-cons" className="block text-xs font-medium text-zinc-600">
            Desventajas
            <textarea
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="Qué falló o qué mejorarías."
              required
              minLength={10}
              maxLength={450}
              rows={3}
              aria-invalid={errorField === "cons"}
              aria-describedby={errorField === "cons" ? "review-cons-error" : undefined}
              className="input-field mt-1"
            />
            {errorField === "cons" && error ? (
              <span id="review-cons-error" className="mt-1 block text-sm font-normal text-red-700">
                {error}
              </span>
            ) : null}
          </label>
          <label id="review-pros" className="block text-xs font-medium text-zinc-600">
            Ventajas
            <textarea
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="Qué funcionó: plazos, trato, contrato…"
              required
              minLength={10}
              maxLength={450}
              rows={3}
              aria-invalid={errorField === "pros"}
              aria-describedby={errorField === "pros" ? "review-pros-error" : undefined}
              className="input-field mt-1"
            />
            {errorField === "pros" && error ? (
              <span id="review-pros-error" className="mt-1 block text-sm font-normal text-red-700">
                {error}
              </span>
            ) : null}
          </label>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-zinc-900">
              Antes de enviar
            </legend>
          <fieldset>
            <legend className="text-xs font-medium text-zinc-600">
              ¿Recomendarías esta inmobiliaria?
            </legend>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {(
                [
                  ["yes", "Sí"],
                  ["no", "No"],
                  ["skip", "Prefiero no decirlo"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="wouldRecommend"
                    checked={wouldRecommend === value}
                    onChange={() => setWouldRecommend(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-start gap-2 text-sm text-zinc-800">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            Publicar de forma anónima (recomendado). Fachada sigue sabiendo
            qué cuenta escribió, en sus registros.
          </label>
          {!anonymous && (
            <label id="review-name" className="block text-xs font-medium text-zinc-600">
              Nombre público
              <input
                value={publicName}
                onChange={(e) => setPublicName(e.target.value)}
                placeholder="No uses un correo"
                maxLength={40}
                aria-invalid={errorField === "name"}
                aria-describedby={errorField === "name" ? "review-name-error" : undefined}
                className="input-field mt-1"
              />
              {errorField === "name" && error ? (
                <span id="review-name-error" className="mt-1 block text-sm font-normal text-red-700">
                  {error}
                </span>
              ) : null}
            </label>
          )}
          <div id="review-themes">
            <IncidentMarkFields marks={marks} onChange={setMarks} />
            {errorField === "themes" && error ? (
              <p className="mt-1 text-sm text-red-700">{error}</p>
            ) : null}
          </div>
          <fieldset id="review-declarations" className="space-y-2 rounded-lg border border-stone-200 p-3">
            <legend className="px-1 text-xs font-semibold text-zinc-700">
              Declaraciones de autenticidad
            </legend>
            <label className="flex items-start gap-2 text-xs text-zinc-700">
              <input
                type="checkbox"
                checked={firstHandAttested}
                onChange={(event) =>
                  setFirstHandAttested(event.target.checked)
                }
                className="mt-0.5"
              />
              Es una experiencia propia y lo escrito distingue hechos de
              opiniones.
            </label>
            <label className="flex items-start gap-2 text-xs text-zinc-700">
              <input
                type="checkbox"
                checked={noIncentiveAttested}
                onChange={(event) =>
                  setNoIncentiveAttested(event.target.checked)
                }
                className="mt-0.5"
              />
              No he recibido dinero, descuento ni otro incentivo por publicarla.
            </label>
            <label className="flex items-start gap-2 text-xs text-zinc-700">
              <input
                type="checkbox"
                checked={noConflictAttested}
                onChange={(event) =>
                  setNoConflictAttested(event.target.checked)
                }
                className="mt-0.5"
              />
              No soy competidor, empleado, familiar ni proveedor con un
              conflicto de interés.
            </label>
            <label className="flex items-start gap-2 text-xs text-zinc-700">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-0.5"
              />
              Acepto las{" "}
              <a href="/legal/normas" className="underline">
                normas de uso y contenidos
              </a>{" "}
              y he leído la{" "}
              <a href="/legal/privacidad" className="underline">
                política de privacidad
              </a>
              .
            </label>
            {errorField === "declarations" && error ? (
              <p className="text-sm text-red-700">{error}</p>
            ) : null}
          </fieldset>
          <label className="block text-xs font-medium text-zinc-600">
            Foto de una página (opcional)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(event) =>
                setEvidence(event.target.files?.[0] ?? null)
              }
              className="mt-1 block w-full text-xs"
            />
            <span className="mt-1 block font-normal text-zinc-500">
              Una foto de una página, un recibo o un mensaje. No subas el
              contrato entero: no cabe. Máximo 3 MB. Tapa datos que no sean
              tuyos. Solo lo ve moderación, y la foto no acredita la
              experiencia por sí sola.
              {evidence
                ? ` Seleccionado: ${evidence.name} (${Math.ceil(evidence.size / 1024)} KB).`
                : ""}
            </span>
          </label>
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

      {step === "done" && published && (
        <div
          key="done"
          className="motion-scale-in mt-4 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-900"
        >
          <p className="font-medium">Reseña publicada</p>
          <p className="mt-1">Ya está en esta ficha.</p>
          <a
            href={`/agencias/${agencySlug}#experiencias`}
            className="mt-2 inline-block underline"
          >
            Verla en la ficha
          </a>
          {evidenceNote ? <p className="mt-1">{evidenceNote}</p> : null}
        </div>
      )}
      {step === "done" && !published && (
        <div
          key="held"
          className="motion-scale-in mt-4 rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-950"
        >
          <p className="font-medium">Reseña retenida</p>
          <p className="mt-1">{holdReason}</p>
          <a href="/cuenta" className="mt-2 inline-block underline">
            Ir a tu cuenta
          </a>
          {evidenceNote ? <p className="mt-1">{evidenceNote}</p> : null}
        </div>
      )}
    </div>
  );
}
