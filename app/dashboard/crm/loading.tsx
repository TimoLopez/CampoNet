function Sk({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} aria-hidden />
}

export default function CrmLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1.5">
          <Sk className="h-8 w-48" />
          <Sk className="h-4 w-56" />
        </div>
        <div className="flex gap-2.5">
          <Sk className="h-9 w-40 rounded-xl" />
          <Sk className="h-9 w-48 rounded-xl" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-5 px-5 py-3 border-b border-[#F2EFE8] bg-[#F9F8F5]">
          <Sk className="h-3 w-10" />
          <Sk className="h-3 w-12" />
          <Sk className="h-3 w-10" />
          <Sk className="h-3 w-14" />
        </div>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-5 px-5 py-3.5 border-b border-[#F7F5F0] last:border-0">
            <div className="flex items-center gap-3 flex-1">
              <Sk className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Sk className="h-4 w-32" />
                <Sk className="h-3 w-24" />
              </div>
            </div>
            <Sk className="h-7 w-32 rounded-full" />
            <Sk className="h-4 w-16" />
            <Sk className="h-3.5 w-10" />
            <Sk className="h-7 w-7 rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
