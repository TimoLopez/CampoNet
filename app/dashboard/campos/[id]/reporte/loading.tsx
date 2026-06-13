import { FileText } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] gap-5 animate-fade-up">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-[#1C3311]/8 flex items-center justify-center">
          <FileText className="h-6 w-6 text-[#2D5018]" />
        </div>
        <div className="absolute -inset-1.5 rounded-[18px] border-2 border-[#1C3311]/10 border-t-[#1C3311]/50 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-semibold text-[#1A1A12]">Generando reporte</p>
        <p className="text-[13px] text-[#8B8A7E] mt-1">Recopilando datos del campo…</p>
      </div>
    </div>
  )
}
