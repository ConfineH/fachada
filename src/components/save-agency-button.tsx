"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { authHeaders, readSessionToken } from "@/lib/auth/session-client";

export function SaveAgencyButton({ agencyId }: { agencyId: string }) {
  const [saved, setSaved] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    const token = readSessionToken();
    if (!token) return;
    void fetch("/api/me", { headers: authHeaders(token) })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { saved?: { id: string }[] } | null) => {
        if (data?.saved?.some((agency) => agency.id === agencyId)) {
          setSaved(true);
        }
      });
  }, [agencyId]);

  async function toggle() {
    const token = readSessionToken();
    if (!token) {
      setHint("Identifícate en tu cuenta para guardar inmobiliarias.");
      return;
    }
    const res = await fetch(
      saved
        ? `/api/me/saved-agencies?agencyId=${agencyId}`
        : "/api/me/saved-agencies",
      {
        method: saved ? "DELETE" : "POST",
        headers: authHeaders(token),
        body: saved ? undefined : JSON.stringify({ agencyId }),
      },
    );
    if (res.status === 401) {
      setHint("Identifícate en tu cuenta para guardar inmobiliarias.");
      return;
    }
    if (!res.ok) {
      setHint("No se pudo actualizar.");
      return;
    }
    setSaved(!saved);
    setHint("");
  }

  return (
    <div>
      <button type="button" onClick={toggle} className="btn-secondary min-h-11">
        {saved ? "Guardada" : "Guardar inmobiliaria"}
      </button>
      {hint && (
        <p className="mt-2 text-xs text-zinc-600">
          {hint}{" "}
          <Link href="/cuenta" className="underline">
            Cuenta
          </Link>
        </p>
      )}
    </div>
  );
}
