import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-white rounded-xl border border-[#E2DFD6] p-5 flex items-center gap-4">
            <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>
        ))}
      </div>

      {/* Hot leads placeholder */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#F2EFE8]">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-[#F2EFE8] last:border-0">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
