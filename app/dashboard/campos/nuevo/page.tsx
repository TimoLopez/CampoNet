import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CampoForm from '@/components/campos/CampoForm'

export default function NuevoCampoPage() {
  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <Link
          href="/dashboard/campos"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#8B8A7E] hover:text-[#1A1A12] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
          Volver a mis campos
        </Link>
        <h1 className="text-[26px] font-bold text-[#1A1A12] mt-2 tracking-tight">Publicar nuevo campo</h1>
        <p className="text-sm text-[#8B8A7E] mt-0.5">Completá los datos para crear la ficha pública</p>
      </div>
      <CampoForm />
    </div>
  )
}
