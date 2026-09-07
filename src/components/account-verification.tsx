"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Step = "email" | "code";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            el: HTMLElement,
            opts: { theme: string; size: string; width: number; text: string },
          ) => void;
        };
      };
    };
  }
}

export function AccountVerification({
  onVerified,
}: {
  onVerified: (token: string) => void;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const onVerifiedRef = useRef(onVerified);
  onVerifiedRef.current = onVerified;
  const [emailEnabled, setEmailEnabled] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/methods")
      .then((res) => res.json())
      .then((data: { email?: boolean }) => {
        if (!cancelled) setEmailEnabled(Boolean(data.email));
      })
      .catch(() => {
        if (!cancelled) setEmailEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!googleClientId) return;

    function handleCredential(response: { credential: string }) {
      setLoading(true);
      setError("");
      void fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "No se pudo entrar con Google");
            return;
          }
          onVerifiedRef.current(data.token);
        })
        .catch(() => {
          setError("No se pudo conectar con el servidor.");
        })
        .finally(() => setLoading(false));
    }

    function renderGoogle() {
      const host = googleButtonRef.current;
      if (!host || !window.google?.accounts.id || !googleClientId) return;
      host.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(host, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }

    if (window.google?.accounts.id) {
      renderGoogle();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", renderGoogle);
      return () => existing.removeEventListener("load", renderGoogle);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = renderGoogle;
    document.head.appendChild(script);
    return () => {
      script.onload = null;
    };
  }, [googleClientId]);

  async function sendCode() {
    setLoading(true);
    setError("");
    setNotice("");
    setDevCode(null);
    setCode("");

    const res = await fetch("/api/auth/request-email-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al enviar el código");
      return false;
    }

    if (typeof data.devCode === "string") {
      setDevCode(data.devCode);
    }
    setStep("code");
    return true;
  }

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    await sendCode();
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-email-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const message = data.error ?? "Código inválido";
      if (
        typeof message === "string" &&
        (message.includes("código activo") ||
          message.includes("caducado") ||
          message.includes("reiniciaste"))
      ) {
        setDevCode(null);
        setCode("");
        setStep("email");
        setError("");
        setNotice(
          "El código anterior ya no vale. Pide uno nuevo al mismo email.",
        );
        return;
      }
      setError(message);
      return;
    }

    onVerified(data.token);
  }

  const waitingForMethods = emailEnabled === null;
  const noAuthReady = !googleClientId && emailEnabled === false;

  return (
    <div className="space-y-4">
      {error && (
        <p className="motion-fade-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {notice && (
        <p className="motion-fade-in rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">
          {notice}
        </p>
      )}

      {waitingForMethods && !googleClientId && (
        <p className="text-sm text-zinc-600">Comprobando cómo identificarte…</p>
      )}

      {noAuthReady && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
          En este sitio aún no se puede identificar una cuenta: falta Google o
          el envío de email. En local el código sale en pantalla, sin Resend.
        </p>
      )}

      {googleClientId && step === "email" && (
        <div>
          <div ref={googleButtonRef} className="flex min-h-11 justify-center" />
          {emailEnabled ? (
            <p className="mt-3 text-center text-xs text-zinc-500">
              o con un código al email
            </p>
          ) : null}
        </div>
      )}

      {step === "email" && emailEnabled && (
        <form
          key="email"
          onSubmit={requestCode}
          className="motion-scale-in space-y-3"
        >
          <label className="block text-sm text-zinc-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              required
              className="input-field mt-1"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full min-h-11"
          >
            Enviar código
          </button>
        </form>
      )}

      {step === "code" && (
        <form key="code" onSubmit={verifyCode} className="motion-scale-in space-y-3">
          <p className="text-sm text-zinc-600">
            Te hemos enviado un código a <strong>{email}</strong>. Caduca en 10
            minutos.
          </p>
          {devCode && (
            <p className="motion-fade-in rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Solo en local (sin Resend): tu código es <strong>{devCode}</strong>
            </p>
          )}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de 6 dígitos"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="input-field"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full min-h-11"
          >
            Verificar
          </button>
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              disabled={loading}
              onClick={() => void sendCode()}
              className="link-brand"
            >
              Reenviar código
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep("email");
                setDevCode(null);
                setCode("");
                setError("");
                setNotice("");
              }}
              className="text-zinc-600 hover:text-zinc-900"
            >
              Cambiar email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
