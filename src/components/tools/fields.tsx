import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

export function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T | "";
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-zinc-800">{legend}</legend>
      <div className="mt-2 grid gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${
              value === option.value
                ? "border-zinc-800 bg-white"
                : "border-stone-300 bg-white"
            }`}
          >
            <input
              className="mt-0.5"
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Result({
  tone,
  title,
  children,
}: {
  tone: "clear" | "doubt" | "neutral";
  title: string;
  children: ReactNode;
}) {
  const toneClass =
    tone === "clear"
      ? "border-teal-200 bg-teal-50"
      : tone === "doubt"
        ? "border-amber-200 bg-amber-50"
        : "border-stone-200 bg-stone-50";

  return (
    <div aria-live="polite" className={`rounded-xl border p-5 ${toneClass}`}>
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-800">{children}</div>
    </div>
  );
}
