export default function CityLoading() {
  return (
    <>
      <div className="min-h-[220px] animate-pulse bg-zinc-800" />
      <div className="mx-auto max-w-6xl space-y-4 px-6 py-10">
        {["a", "b", "c", "d"].map((slot) => (
          <div
            key={slot}
            className="h-36 animate-pulse rounded-xl border border-stone-200 bg-white"
          />
        ))}
      </div>
    </>
  );
}
