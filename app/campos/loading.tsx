export default function CamposLoading() {
  return (
    <div className="min-h-screen bg-[#F4F2EB] antialiased">
      {/* Navbar skeleton */}
      <header className="sticky top-0 z-40 border-b border-[#E4E0D6] bg-white/70">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="h-8 w-32 rounded-xl bg-[#E4E0D6] animate-pulse" />
          <div className="h-7 w-24 rounded-full bg-[#E4E0D6] animate-pulse" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-10">
        {/* Page header skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-8 w-56 rounded-xl bg-[#E4E0D6] animate-pulse" />
          <div className="h-4 w-32 rounded-lg bg-[#E4E0D6] animate-pulse" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="rounded-2xl border border-[#E4E0D6] bg-white p-5 space-y-5">
              <div className="h-5 w-20 rounded-lg bg-[#E4E0D6] animate-pulse" />
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-[#E4E0D6] animate-pulse" />
                  <div className="h-9 w-full rounded-xl bg-[#E4E0D6] animate-pulse" />
                </div>
              ))}
            </div>
          </aside>

          {/* Grid skeleton */}
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#E4E0D6] bg-white overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-[#E4E0D6] animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 rounded bg-[#E4E0D6] animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-[#E4E0D6] animate-pulse" />
                    <div className="flex justify-between pt-2 border-t border-[#F0EDE5]">
                      <div className="h-4 w-16 rounded bg-[#E4E0D6] animate-pulse" />
                      <div className="h-4 w-24 rounded bg-[#E4E0D6] animate-pulse" />
                    </div>
                    <div className="h-3 w-28 rounded bg-[#E4E0D6] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
