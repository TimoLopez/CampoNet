import type { FunnelStats } from '@/lib/dal/inteligencia'

interface Props {
  stats: FunnelStats
}

function pct(num: number, denom: number) {
  if (denom === 0) return 0
  return Math.round((num / denom) * 100 * 10) / 10
}

export default function FunnelChart({ stats }: Props) {
  const stages = [
    { label: 'Visitas online (90d)', value: stats.visitasOnline, prev: null, width: 100 },
    { label: 'Consultas recibidas', value: stats.consultas, prev: stats.visitasOnline, width: 80 },
    { label: 'Leads activos', value: stats.leadsActivos, prev: stats.consultas, width: 60 },
    { label: 'En negociación', value: stats.enNegociacion, prev: stats.leadsActivos, width: 40 },
    { label: 'Cerrados', value: stats.cerrados, prev: stats.enNegociacion, width: 25 },
  ]

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-[15px] font-bold text-[#1A1A12] mb-1">Funnel del negocio</h2>
      <p className="text-[12px] text-[#8B8A7E] mb-5">Conversión de visitantes a clientes cerrados.</p>

      <div className="space-y-3">
        {stages.map((s, i) => {
          const conversion = s.prev !== null ? pct(s.value, s.prev) : null
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12.5px] text-[#5C5B4F] font-medium">{s.label}</span>
                <div className="flex items-center gap-2">
                  {conversion !== null && (
                    <span className="text-[11px] text-[#8B8A7E] tabular-nums">{conversion}%</span>
                  )}
                  <span className="text-[14px] font-bold text-[#1A1A12] tabular-nums">{s.value.toLocaleString('es-UY')}</span>
                </div>
              </div>
              <div className="h-7 bg-[#F2EFE8] rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500"
                  style={{
                    width: `${s.width}%`,
                    background: `linear-gradient(90deg, #1C3311 0%, #2D5018 100%)`,
                    opacity: 0.85 - i * 0.1,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
