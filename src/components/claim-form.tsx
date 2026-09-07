"use client";

import { FormEvent, useState } from "react";

import {
  CLAIM_EVIDENCE_LABELS,
  REPRESENTATIVE_ROLE_LABELS,
} from "@/lib/domain/claim-verification";
import type { ClaimEvidenceType, RepresentativeRole } from "@/lib/domain/types";

import { BusinessPhoneVerification } from "@/components/business-phone-verification";
import { PhoneVerification } from "@/components/phone-verification";

type Step = "personal" | "business" | "claim" | "done";

const EVIDENCE_TYPES = Object.keys(
  CLAIM_EVIDENCE_LABELS,
) as ClaimEvidenceType[];

export function ClaimForm({
  agencyId,
  agencyClaimed,
  agencyPhonePublished,
  agencyPhoneHint,
  agencyEmailDomainHint,
  requiresCif,
}: {
  agencyId: string;
  agencyClaimed: boolean;
  agencyPhonePublished: boolean;
  agencyPhoneHint: string;
  agencyEmailDomainHint: string;
  requiresCif: boolean;
}) {
  const [step, setStep] = useState<Step>("personal");
  const [token, setToken] = useState("");
  const [businessVerified, setBusinessVerified] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("+34");
  const [representativeRole, setRepresentativeRole] =
    useState<RepresentativeRole>("administrador");
  const [companyCif, setCompanyCif] = useState("");
  const [evidence, setEvidence] = useState<
    Array<{ type: ClaimEvidenceType; url: string }>
  >([{ type: "cif_document", url: "" }]);
  const [attestation, setAttestation] = useState(false);
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

  function updateEvidence(
    index: number,
    field: "type" | "url",
    value: string,
  ) {
    setEvidence((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  async function submitClaim(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      agencyId,
      contactName,
      contactEmail,
      contactPhone,
      representativeRole,
      companyCif: companyCif.trim() || undefined,
      evidence: evidence.filter((e) => e.url.trim()),
      attestationAccepted: attestation as true,
    };

    const res = await fetch("/api/claims", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
        {agencyPhonePublished
          ? "Verificamos teléfono de la ficha, email corporativo y documentación (estilo Google Business / Glassdoor)."
          : "Esta ficha no tiene teléfono público: solo reclamo documental con revisión manual estricta."}
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "personal" && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-stone-800">
            Paso 1 — Tu móvil personal
          </p>
          <PhoneVerification
            onVerified={(sessionToken) => {
              setToken(sessionToken);
              setStep(agencyPhonePublished ? "business" : "claim");
            }}
          />
        </div>
      )}

      {step === "business" && agencyPhonePublished && (
        <div className="mt-4 space-y-4">
          <BusinessPhoneVerification
            agencyId={agencyId}
            agencyPhoneHint={agencyPhoneHint}
            sessionToken={token}
            onVerified={() => {
              setBusinessVerified(true);
              setStep("claim");
            }}
          />
          {!businessVerified && (
            <p className="text-xs text-stone-500">
              Si no tienes acceso al teléfono de la ficha, no podrás reclamar
              este perfil (evita suplantaciones).
            </p>
          )}
        </div>
      )}

      {step === "claim" && (
        <form onSubmit={submitClaim} className="mt-4 space-y-3">
          <p className="text-sm font-medium text-stone-800">
            Paso {agencyPhonePublished ? "3" : "2"} — Identidad y documentación
          </p>
          {!agencyPhonePublished && (
            <p className="text-xs text-amber-900">
              Necesitamos al menos dos documentos fuertes (CIF, registro,
              poder) o uno fuerte más prueba de web/portal en la ficha.
            </p>
          )}
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nombre y apellidos"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <select
            value={representativeRole}
            onChange={(e) =>
              setRepresentativeRole(e.target.value as RepresentativeRole)
            }
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          >
            {(
              Object.entries(REPRESENTATIVE_ROLE_LABELS) as [
                RepresentativeRole,
                string,
              ][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder={`Email corporativo (@${agencyEmailDomainHint})`}
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Tu móvil (+346...)"
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2"
          />
          {requiresCif && (
            <input
              value={companyCif}
              onChange={(e) => setCompanyCif(e.target.value)}
              placeholder="CIF de la sociedad"
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          )}

          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-stone-800">
              Documentación (enlaces seguros, PDF en Drive, etc.)
            </p>
            {evidence.map((item, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={item.type}
                  onChange={(e) =>
                    updateEvidence(index, "type", e.target.value)
                  }
                  className="rounded-lg border border-stone-300 px-3 py-2 sm:w-1/2"
                >
                  {EVIDENCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {CLAIM_EVIDENCE_LABELS[type]}
                    </option>
                  ))}
                </select>
                <input
                  value={item.url}
                  onChange={(e) => updateEvidence(index, "url", e.target.value)}
                  placeholder="https://..."
                  className="rounded-lg border border-stone-300 px-3 py-2 sm:flex-1"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setEvidence((c) => [...c, { type: "cif_document", url: "" }])
              }
              className="text-sm text-amber-800 hover:underline"
            >
              + Añadir otro documento
            </button>
          </div>

          <label className="flex gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={attestation}
              onChange={(e) => setAttestation(e.target.checked)}
              required
            />
            Declaro bajo mi responsabilidad que represento legalmente a esta
            inmobiliaria y que la documentación es auténtica.
          </label>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-stone-900 py-2 font-medium text-white"
          >
            Enviar a revisión
          </button>
        </form>
      )}

      {step === "done" && (
        <p className="mt-4 text-sm text-emerald-700">
          Solicitud enviada. Un administrador validará email, documentos y
          coincidencia con la ficha antes de activar el panel.
        </p>
      )}
    </div>
  );
}
