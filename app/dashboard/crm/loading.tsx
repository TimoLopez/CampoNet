import { Skeleton } from '@/components/ui/skeleton'

export default function CrmLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        {/* Filters skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#E2DFD6] bg-[#F7F5F0]">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16 ml-auto sm:ml-0" />
          <Skeleton className="h-3 w-12 hidden sm:block" />
          <Skeleton className="h-3 w-20 hidden sm:block" />
        </div>
        {/* Rows */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-[#F2EFE8] last:border-0">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-12 hidden sm:block" />
            <Skeleton className="h-3.5 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-4 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
