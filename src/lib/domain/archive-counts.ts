export type ArchiveTotals = {
  agencies: number;
  municipalities: number;
  experiences: number;
};

function labeled(count: number, singular: string, plural: string) {
  return `${count.toLocaleString("es-ES")} ${count === 1 ? singular : plural}`;
}

/** Tres cifras distintas: no suma presencias ni reparte una experiencia por cada oficina. */
export function archivePublicLine(totals: ArchiveTotals) {
  return [
    labeled(totals.agencies, "inmobiliaria", "inmobiliarias"),
    labeled(totals.municipalities, "municipio", "municipios"),
    labeled(
      totals.experiences,
      "experiencia publicada",
      "experiencias publicadas",
    ),
  ].join(" · ");
}
