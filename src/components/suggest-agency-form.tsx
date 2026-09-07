"use client";

import { FormEvent, useState } from "react";

import { PhoneVerification } from "@/components/phone-verification";
import { SubmissionStepper } from "@/components/submission-stepper";

type Step = "verify" | "form" | "done";

export function SuggestAgencyForm() {
  const [step, setStep] = useState<Step>("verify");
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [noPhoneOnline, setNoPhoneOnline] = useState(false);
  const [phone, setPhone] = useState("+34");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [idealistaUrl, setIdealistaUrl] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/agency-submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        city,
        postalCode,
        address,
        noPhoneOnline,
        phone: noPhoneOnline ? undefined : phone,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        idealistaUrl: idealistaUrl.trim() || undefined,
        note: note.trim() || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar la solicitud");
      return;
    }

    setStep("done");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,240px)_1fr]">
      <SubmissionStepper phase={step} />
      <div>
      {error && (
        <p className="motion-fade-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "verify" && (
        <div key="verify" className="motion-scale-in card-raised p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Verificación</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Verifica tu móvil para enviar la solicitud (evita spam).
          </p>
          <div className="mt-6">
          <PhoneVerification
            onVerified={(sessionToken) => {
              setToken(sessionToken);
              setStep("form");
            }}
          />
          </div>
        </div>
      )}

      {step === "form" && (
        <form
          key="form"
          onSubmit={submit}
          className="motion-scale-in card-raised space-y-4 p-6"
        >
          <h2 className="text-lg font-semibold text-zinc-900">Datos básicos</h2>
          <div>
            <label className="text-sm font-medium text-zinc-800">
              Nombre comercial <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-zinc-500">
              El nombre exacto bajo el cual opera comercialmente.
            </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Fincas del Sol"
            required
            className="input-field mt-2"
          />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Madrid"
              required
              className="input-field"
            />
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="28001"
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-800">
              Dirección física <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-zinc-500">
              Oficina principal; ayuda a verificar el local.
            </p>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle de Serrano, 42"
            required
            className="input-field mt-2"
          />
          </div>
          <label className="flex gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={noPhoneOnline}
              onChange={(e) => setNoPhoneOnline(e.target.checked)}
            />
            No hay teléfono de la inmobiliaria publicado en internet
          </label>
          {!noPhoneOnline && (
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Teléfono de la inmobiliaria (+34...)"
              required
              className="input-field"
            />
          )}
          {noPhoneOnline && (
            <p className="text-xs text-stone-500">
              La ficha se publicará con aviso de contacto no verificado. Las
              reseñas sí estarán disponibles.
            </p>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email de contacto (opcional)"
            className="input-field"
          />
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Web (opcional)"
            className="input-field"
          />
          <input
            value={idealistaUrl}
            onChange={(e) => setIdealistaUrl(e.target.value)}
            placeholder="Enlace Idealista/Fotocasa (recomendado si no hay teléfono)"
            className="input-field"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota para moderación (opcional)"
            rows={3}
            className="input-field"
          />
          <div className="flex justify-end pt-2">
          <button
            disabled={loading}
            type="submit"
            className="btn-primary min-h-11 px-8"
          >
            Enviar a revisión
          </button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div key="done" className="motion-scale-in card-raised p-6">
        <p className="text-sm text-emerald-800">
          Solicitud recibida. Cuando un administrador la apruebe, la
          inmobiliaria aparecerá en el buscador y podrás dejar tu reseña.
        </p>
        </div>
      )}
      </div>
    </div>
  );
}
