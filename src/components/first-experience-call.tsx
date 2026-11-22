export function FirstExperienceCall({ agencyName }: { agencyName: string }) {
  return (
    <div id="experiencias" className="card-raised mt-8 p-6">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
        Nadie ha contado todavía esta gestión
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
        Si alquilaste o encargaste la gestión con {agencyName}, la tuya sería la
        primera experiencia.
      </p>
      <a
        href="#dejar-resena"
        className="btn-primary mt-5 inline-flex min-h-12 w-full items-center justify-center sm:w-auto"
      >
        Contar la primera experiencia
      </a>
    </div>
  );
}
