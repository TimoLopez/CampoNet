import { Globe, Search, Link as LinkIcon, FileText } from 'lucide-react'
import type { OrigenLeadsStats } from '@/lib/dal/inteligencia'

interface Props {
  stats: OrigenLeadsStats
}

export default function OrigenLeads({ stats }: Props) {
  const total = stats.pagina_publica + stats.buscador + stats.directo + stats.manual
  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6">
        <h2 className="text-[15px] font-bold text-[#1A1A12] mb-3">Origen de leads</h2>
        <p className="text-[12px] text-[#8B8A7E]">Cuando lleguen tus primeros leads vas a ver acá de dónde vinieron.</p>
      </div>
    )
  }

  const items = [
    { key: 'pagina_publica' as const, label: 'Página pública', icon: Globe, color: '#1C3311' },
    { key: 'buscador' as const, label: 'Buscador CampoNet', icon: Search, color: '#8B6914' },
    { key: 'directo' as const, label: 'Link directo / WhatsApp', icon: LinkIcon, color: '#5C5B4F' },
    { key: 'manual' as const, label: 'Carga manual', icon: FileText, color: '#B0AD9E' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-[15px] font-bold text-[#1A1A12] mb-1">Origen de leads</h2>
      <p className="text-[12px] text-[#8B8A7E] mb-5">De dónde vienen tus contactos.</p>

      <div className="space-y-3">
        {items.map(({ key, label, icon: Icon, color }) => {
          const value = stats[key]
          const pct = total > 0 ? Math.round((value / total) * 100) : 0
          if (value === 0) return null
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                  <span className="text-[12.5px] text-[#5C5B4F]">{label}</span>
                </div>
                <span className="text-[12px] tabular-nums">
                  <strong className="text-[#1A1A12]">{value}</strong>
                  <span className="text-[#8B8A7E] ml-1.5">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 bg-[#F2EFE8] rounded overflow-hidden">
                <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
