import { Skeleton } from '@/components/ui/skeleton'

export default function LeadDetailLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back link + header */}
      <div>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="flex items-center gap-3 mt-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-40 mt-2" />
      </div>

      {/* Contact card */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 space-y-3">
        <Skeleton className="h-4 w-32 mb-1" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 rounded shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        </div>
        <Skeleton className="h-3 w-40 mt-2" />
      </div>

      {/* Notes card */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* Visit history card */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-[#F2EFE8] last:border-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
