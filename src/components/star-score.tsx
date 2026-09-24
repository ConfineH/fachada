export function StarScore({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const slotClass =
    size === "lg" ? "size-6" : size === "sm" ? "size-3.5" : "size-4";
  const gap = size === "sm" ? "gap-0.5" : "gap-1";

  return (
    <span className={`inline-flex flex-nowrap ${gap}`} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <StarSlot
          key={index}
          fill={Math.min(1, Math.max(0, score - index))}
          slotClass={slotClass}
        />
      ))}
    </span>
  );
}

function StarSlot({
  fill,
  slotClass,
}: {
  fill: number;
  slotClass: string;
}) {
  const amount = Math.round(fill * 1000) / 1000;

  return (
    <span className={`relative block shrink-0 ${slotClass}`} data-fill={amount}>
      <StarIcon className="size-full text-stone-300" />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${amount * 100}%` }}
      >
        <StarIcon className={`absolute top-0 left-0 ${slotClass} text-rating`} />
      </span>
    </span>
  );
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
