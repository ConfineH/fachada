export default function AgencyRegistryLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-6 py-16">
      <div className="h-8 w-48 animate-pulse rounded bg-stone-200" />
      {["a", "b", "c", "d"].map((slot) => (
        <div
          key={slot}
          className="h-32 animate-pulse rounded-xl border border-stone-200 bg-white"
        />
      ))}
    </div>
  );
}
