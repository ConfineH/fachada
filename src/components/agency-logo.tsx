export function AgencyLogo({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (!src) return null;
  const dim =
    size === "lg"
      ? "h-16 w-16"
      : size === "sm"
        ? "h-8 w-8"
        : "h-11 w-11";
  return (
    <img
      src={src}
      alt={`Logotipo de ${name}`}
      className={`${dim} shrink-0 rounded-lg border border-stone-200 bg-white object-contain p-1`}
    />
  );
}
