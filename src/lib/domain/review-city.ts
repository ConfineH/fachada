export function experienceCityLabel(city: string | null | undefined) {
  const value = city?.trim();
  return value || "Ciudad no indicada";
}

export function reviewsForCityFilter<T extends { experienceCity?: string | null }>(
  reviews: T[],
  city: string | null | undefined,
) {
  const filter = city?.trim() ?? "";
  if (!filter) return { visible: reviews, omittedWithoutCity: 0 };
  const needle = filter.toLocaleLowerCase("es");
  const visible = reviews.filter(
    (review) => review.experienceCity?.trim().toLocaleLowerCase("es") === needle,
  );
  const omittedWithoutCity = reviews.filter(
    (review) => !review.experienceCity?.trim(),
  ).length;
  return { visible, omittedWithoutCity };
}
