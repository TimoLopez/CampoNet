import { Clock } from 'lucide-react'
import type { TiempoVentaPorTipo } from '@/lib/dal/inteligencia'

const TIPO_LABEL: Record<string, string> = {
  ganadero: 'Ganadero',
  agricola: 'Agrícola',
  forestal: 'Forestal',
  mixto: 'Mixto',
  turistica: 'Turístico',
  sin_tipo: 'Sin tipo',
}

interface Props {
  tiempos: TiempoVentaPorTipo[]
}

export default function TiemposChart({ tiempos }: Props) {
  if (tiempos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-[#8B6914]" />
          <h2 className="text-[15px] font-bold text-[#1A1A12]">Tiempo promedio de venta</h2>
        </div>
        <p className="text-[12px] text-[#8B8A7E]">
          Cuando cierres tu primer campo, vas a ver acá cuánto tardaste y cómo se compara entre tipos.
        </p>
      </div>
    )
  }

  const max = Math.max(...tiempos.map(t => t.diasPromedio), 1)

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-[#8B6914]" />
        <h2 className="text-[15px] font-bold text-[#1A1A12]">Tiempo promedio de venta</h2>
      </div>
      <p className="text-[12px] text-[#8B8A7E] mb-5">Por tipo de campo, en días desde publicación a cierre.</p>

      <div className="space-y-3">
        {tiempos.map(t => (
          <div key={t.tipo}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12.5px] text-[#5C5B4F] font-medium">{TIPO_LABEL[t.tipo] ?? t.tipo}</span>
              <span className="text-[12px] text-[#1A1A12] tabular-nums">
                <strong>{t.diasPromedio}</strong> días
                <span className="text-[#8B8A7E] ml-1.5">({t.cantidad} {t.cantidad === 1 ? 'venta' : 'ventas'})</span>
              </span>
            </div>
            <div className="h-3 bg-[#F2EFE8] rounded overflow-hidden">
              <div
                className="h-full bg-[#C49A3C]/80 rounded transition-all duration-500"
                style={{ width: `${(t.diasPromedio / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
