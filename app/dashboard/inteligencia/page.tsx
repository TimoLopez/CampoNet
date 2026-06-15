import { createClient } from '@/lib/supabase/server'
import { BarChart3 } from 'lucide-react'
import { getFunnelStats, getPerformancePorCampo, getTiemposDeVenta } from '@/lib/dal/inteligencia'
import FunnelChart from './FunnelChart'
import PerformancePorCampo from './PerformancePorCampo'
import TiemposChart from './TiemposChart'

export default async function InteligenciaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [funnel, performance, tiempos] = await Promise.all([
    getFunnelStats(user!.id),
    getPerformancePorCampo(user!.id),
    getTiemposDeVenta(user!.id),
  ])

  return (
    <div className="space-y-7 animate-fade-up max-w-4xl">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1C3311]/8 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-[#2D5018]" />
          </div>
          <div>
            <h1 className="text-[26px] font-bold text-[#1A1A12] tracking-tight">Inteligencia</h1>
            <p className="text-sm text-[#8B8A7E]">Métricas y performance de tu negocio</p>
          </div>
        </div>
      </div>

      <FunnelChart stats={funnel} />
      <PerformancePorCampo campos={performance} />
      <TiemposChart tiempos={tiempos} />
    </div>
  )
}
