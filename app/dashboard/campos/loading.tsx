function Sk({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} aria-hidden />
}

function CampoCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden">
      <Sk className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Sk className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Sk className="h-3.5 w-3.5 rounded" />
          <Sk className="h-3.5 w-28" />
        </div>
        <Sk className="h-5 w-24" />
        <div className="flex gap-2 pt-1">
          <Sk className="h-9 flex-1 rounded-xl" />
          <Sk className="h-9 w-9 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  )
}

export default function CamposLoading() {
  return (
    <div className="space-y-7 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Sk className="h-8 w-36" />
          <Sk className="h-4 w-40" />
        </div>
        <Sk className="h-11 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map(i => <CampoCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
