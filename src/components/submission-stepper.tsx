const steps = [
  { id: 1, title: "Verificación", subtitle: "Identidad del solicitante" },
  { id: 2, title: "Datos básicos", subtitle: "Identificación comercial" },
  { id: 3, title: "Confirmación", subtitle: "Revisión por moderación" },
] as const;

export type SubmissionStepperPhase = "verify" | "form" | "done";

function activeStep(phase: SubmissionStepperPhase): number {
  if (phase === "verify") return 1;
  if (phase === "form") return 2;
  return 3;
}

export function SubmissionStepper({
  phase,
}: {
  phase: SubmissionStepperPhase;
}) {
  const current = activeStep(phase);

  return (
    <ol className="card-raised space-y-0 p-6">
      {steps.map((step, index) => {
        const isActive = step.id === current;
        const isComplete = step.id < current;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-zinc-200"
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-[background-color,color,transform] ${
                isActive
                  ? "bg-brand text-white scale-105"
                  : isComplete
                    ? "bg-zinc-800 text-white"
                    : "border border-zinc-200 bg-white text-zinc-400"
              }`}
              style={{
                transitionDuration: "var(--duration-ui)",
                transitionTimingFunction: "var(--ease-out)",
              }}
            >
              {step.id}
            </span>
            <div
              className="transition-opacity"
              style={{
                opacity: isActive ? 1 : 0.6,
                transitionDuration: "var(--duration-ui)",
                transitionTimingFunction: "var(--ease-soft)",
              }}
            >
              <p className="text-sm font-semibold text-zinc-900">{step.title}</p>
              <p className="text-xs text-zinc-500">{step.subtitle}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
