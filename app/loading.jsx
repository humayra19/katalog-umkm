export default function Loading() {
  return (
    <div className="py-8 md:py-12 animate-pulse">
      {/* Skeleton Header */}
      <div className="max-w-xl">
        <div className="h-10 w-48 rounded-lg bg-permukaan" />
        <div className="mt-3 h-5 w-80 rounded-md bg-permukaan" />
      </div>

      {/* Skeleton Filter & Search */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-full bg-permukaan" />
          <div className="h-8 w-24 rounded-full bg-permukaan" />
          <div className="h-8 w-20 rounded-full bg-permukaan" />
        </div>
        <div className="h-10 w-full rounded-lg bg-permukaan sm:w-64" />
      </div>

      {/* Skeleton Grid Kartu Produk */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
          >
            <div className="aspect-square w-full bg-permukaan" />
            <div className="flex flex-1 flex-col gap-2 p-3">
              <div className="h-3 w-16 rounded-md bg-permukaan" />
              <div className="h-5 w-3/4 rounded-md bg-permukaan" />
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="h-6 w-20 rounded-md bg-permukaan" />
                <div className="h-6 w-16 rounded-md bg-permukaan" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

