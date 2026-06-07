function Sk({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} aria-hidden />
}

export default function LeadDetailLoading() {
  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      {/* Back link */}
      <Sk className="h-4 w-24" />

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6">
        <div className="flex items-start gap-4">
          <Sk className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Sk className="h-7 w-48" />
            <div className="flex items-center gap-2">
              <Sk className="h-6 w-20 rounded-full" />
              <Sk className="h-4 w-36" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact card */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 space-y-4">
        <Sk className="h-5 w-32 mb-2" />
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Sk className="w-8 h-8 rounded-lg shrink-0" />
            <Sk className="h-4 w-48" />
          </div>
        ))}
      </div>

      {/* Notes card */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 space-y-3">
        <Sk className="h-5 w-28" />
        <Sk className="h-32 w-full rounded-xl" />
      </div>

      {/* Visit history */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#F9F8F5] border-b border-[#F7F5F0]">
          <Sk className="h-5 w-36" />
          <Sk className="h-4 w-16" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center justify-between px-6 py-3.5 border-b border-[#F7F5F0] last:border-0">
            <div className="flex items-center gap-3">
              <Sk className="w-2 h-2 rounded-full" />
              <Sk className="h-4 w-40" />
            </div>
            <Sk className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
