export default function Loading() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="h-8 w-48 bg-[#E2DFD6] rounded" />
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-[#E2DFD6]" />)}
      </div>
      <div className="h-64 bg-white rounded-2xl border border-[#E2DFD6]" />
    </div>
  )
}
