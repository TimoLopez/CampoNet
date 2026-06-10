import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import VisitasChart from '@/components/campos/VisitasChart'
import { getCampoById } from '@/lib/dal/campos'
import { getVisitasByDayForCampo } from '@/lib/dal/visitas'

export default async function EstadisticasCampoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [campo, visitasData] = await Promise.all([
    getCampoById(id, user!.id),
    getVisitasByDayForCampo(id),
  ])

  if (!campo) notFound()

  const totalVisitas = visitasData.reduce((sum, d) => sum + d.visitas, 0)

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
        <div className="flex items-center gap-2.5 mt-2">
          <div className="w-8 h-8 rounded-lg bg-[#1C3311]/8 flex items-center justify-center">
            <BarChart2 className="h-4 w-4 text-[#2D5018]" />
          </div>
          <div>
            <h1 className="text-[26px] font-bold text-[#1A1A12] tracking-tight">Estadísticas</h1>
            <p className="text-sm text-[#8B8A7E] truncate max-w-[320px]">{campo.titulo}</p>
          </div>
        </div>
      </div>

      <VisitasChart data={visitasData} totalVisitas={totalVisitas} />

      {/* Placeholder for future metrics */}
      <div className="bg-white rounded-2xl border border-dashed border-[#E2DFD6] p-8 text-center">
        <BarChart2 className="h-6 w-6 text-[#C2BFB5] mx-auto mb-3" />
        <p className="text-[13.5px] text-[#8B8A7E]">Más métricas próximamente</p>
      </div>
    </div>
  )
}
