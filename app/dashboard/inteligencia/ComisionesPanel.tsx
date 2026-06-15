import { DollarSign, Calendar } from 'lucide-react'
import type { ComisionesStats } from '@/lib/dal/inteligencia'

interface Props {
  stats: ComisionesStats
}

function fmtUSD(n: number) {
  return `USD ${n.toLocaleString('es-UY')}`
}

export default function ComisionesPanel({ stats }: Props) {
  const maxMes = Math.max(...stats.porMes.map(m => m.usd), 1)

  return (
    <div className="bg-gradient-to-br from-[#1C3311] to-[#0F1F09] rounded-2xl p-6 text-white shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-1">
        <DollarSign className="h-4 w-4 text-[#C49A3C]" />
        <h2 className="text-[15px] font-bold">Comisiones generadas</h2>
      </div>
      <p className="text-[12px] text-white/55 mb-5">Resumen del año en curso.</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[11px] text-white/55 uppercase tracking-wider mb-1">Cerradas YTD</p>
          <p className="text-2xl font-bold text-[#C49A3C] tabular-nums">{fmtUSD(stats.cerradoYTD)}</p>
          <p className="text-[11px] text-white/55 mt-1">{stats.cantidadCerrados} {stats.cantidadCerrados === 1 ? 'campo cerrado' : 'campos cerrados'}</p>
        </div>
        <div>
          <p className="text-[11px] text-white/55 uppercase tracking-wider mb-1">Pipeline</p>
          <p className="text-2xl font-bold text-white tabular-nums">{fmtUSD(stats.pipelineUSD)}</p>
          <p className="text-[11px] text-white/55 mt-1">En negociación</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar className="h-3.5 w-3.5 text-white/40" />
          <p className="text-[11.5px] text-white/55 uppercase tracking-wider">Últimos 12 meses</p>
        </div>
        <div className="flex items-end justify-between gap-1 h-24">
          {stats.porMes.map((m) => {
            const h = (m.usd / maxMes) * 100
            const [, mesNum] = m.mes.split('-')
            const label = ['E','F','M','A','M','J','J','A','S','O','N','D'][parseInt(mesNum) - 1]
            return (
              <div key={m.mes} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end h-20">
                  <div
                    className="w-full bg-[#C49A3C]/70 rounded-t transition-all duration-500 hover:bg-[#C49A3C]"
                    style={{ height: `${Math.max(h, 2)}%` }}
                    title={`${m.mes}: ${fmtUSD(m.usd)}`}
                  />
                </div>
                <span className="text-[9px] text-white/40">{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
