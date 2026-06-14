export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#1C3311]/20 border-t-[#1C3311] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#8B8A7E]">Cargando reporte…</p>
      </div>
    </div>
  )
}
