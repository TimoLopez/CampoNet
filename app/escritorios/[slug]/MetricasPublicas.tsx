import { MapPin, Layers, TrendingUp } from 'lucide-react'
import type { CampoPublicoCard } from '@/lib/dal/campos'

interface Props {
  campos: CampoPublicoCard[]
}

export default function MetricasPublicas({ campos }: Props) {
  const totalCampos = campos.length
  const totalHectareas = campos.reduce((sum, c) => sum + (c.hectareas ?? 0), 0)
  const departamentos = new Set(campos.map(c => c.departamento)).size

  if (totalCampos === 0) return null

  const stats = [
    { label: 'Campos en cartera', value: totalCampos, icon: Layers },
    { label: 'Hectáreas totales', value: totalHectareas.toLocaleString('es-UY'), icon: TrendingUp },
    { label: 'Departamentos', value: departamentos, icon: MapPin },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-white rounded-2xl border border-[#E2DFD6] p-4 text-center">
          <Icon className="h-4 w-4 text-[#8B6914] mx-auto mb-2" />
          <p className="text-[18px] sm:text-2xl font-bold text-[#1A1A12] tabular-nums leading-none">{value}</p>
          <p className="text-[10.5px] text-[#8B8A7E] mt-1.5 leading-snug">{label}</p>
        </div>
      ))}
    </div>
  )
}
