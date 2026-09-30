"use client";

import {
  INCIDENT_TAG_LABELS,
  INCIDENT_TAGS,
  type IncidentMark,
  type IncidentMarks,
  type IncidentTag,
} from "@/lib/domain/incidents";

export function IncidentMarkFields({
  marks,
  onChange,
}: {
  marks: IncidentMarks;
  onChange: (marks: IncidentMarks) => void;
}) {
  function toggle(tag: IncidentTag) {
    const next = { ...marks };
    if (next[tag]) delete next[tag];
    else next[tag] = "unset";
    onChange(next);
  }

  function setMark(tag: IncidentTag, mark: IncidentMark) {
    onChange({ ...marks, [tag]: mark });
  }

  return (
    <fieldset>
      <legend className="text-xs font-medium text-zinc-600">
        Temas (opcional)
      </legend>
      <p className="mt-1 text-xs text-zinc-500">
        Si marcas un tema, di si en tu caso fue bien o mal.
      </p>
      <ul className="mt-2 grid gap-3 sm:grid-cols-2">
        {INCIDENT_TAGS.map((tag) => {
          const mark = marks[tag];
          return (
            <li key={tag}>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-800">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={Boolean(mark)}
                  onChange={() => toggle(tag)}
                />
                {INCIDENT_TAG_LABELS[tag]}
              </label>
              {mark ? (
                <div className="mt-1 ml-6 flex gap-3 text-xs text-zinc-700">
                  {(
                    [
                      ["positiva", "Bien"],
                      ["negativa", "Mal"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name={`tema-${tag}`}
                        checked={mark === value}
                        onChange={() => setMark(tag, value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
