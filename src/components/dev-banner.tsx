import Link from "next/link";

export function DevBanner({ storage }: { storage: "memory" | "supabase" }) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <p>
          Modo desarrollo · Datos en{" "}
          <strong>{storage === "memory" ? "memoria" : "Supabase"}</strong>
          {storage === "memory" &&
            " (se borran al reiniciar npm run dev; usa Supabase en .env.local para persistir)"}
        </p>
        <Link href="/admin" className="font-medium underline">
          Panel admin
        </Link>
      </div>
    </div>
  );
}
