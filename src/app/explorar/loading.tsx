export default function ExplorarLoading() {
  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="h-3 w-40 animate-pulse rounded bg-stone-200" />
        <div className="mt-4 h-10 w-80 max-w-full animate-pulse rounded bg-stone-200" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-stone-100" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-4 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((slot) => (
          <div
            key={slot}
            className="min-h-[168px] animate-pulse rounded-xl bg-zinc-200"
          />
        ))}
      </div>
    </div>
  );
}
