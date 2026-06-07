function Sk({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} aria-hidden />
}

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <Sk className="h-3 w-20" />
        <Sk className="h-8 w-52" />
        <Sk className="h-4 w-44" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-[#E2DFD6] p-5 flex items-center gap-4">
            <Sk className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Sk className="h-8 w-12" />
              <Sk className="h-3.5 w-28" />
            </div>
          </div>
        ))}
      </div>

      {/* Hot leads placeholder */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F2EFE8] bg-[#F9F8F5]">
          <Sk className="h-7 w-7 rounded-lg" />
          <Sk className="h-4 w-32" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-[#F7F5F0] last:border-0">
            <div className="flex items-center gap-3">
              <Sk className="w-7 h-7 rounded-full" />
              <div className="space-y-1.5">
                <Sk className="h-4 w-36" />
                <Sk className="h-3 w-24" />
              </div>
            </div>
            <Sk className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
