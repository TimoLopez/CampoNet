import Link from 'next/link'
import { Flame, Snowflake } from 'lucide-react'
import type { CampoPerformance } from '@/lib/dal/inteligencia'

interface Props {
  campos: CampoPerformance[]
}

export default function PerformancePorCampo({ campos }: Props) {
  if (campos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#E2DFD6] p-8 text-center">
        <p className="text-[13px] text-[#8B8A7E]">Sin campos para analizar todavía.</p>
      </div>
    )
  }

  // Sort: most engagement first
  const sorted = [...campos].sort((a, b) => (b.visitas + b.consultas * 5) - (a.visitas + a.consultas * 5))

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F2EFE8]">
        <h2 className="text-[15px] font-bold text-[#1A1A12]">Performance por campo</h2>
        <p className="text-[12px] text-[#8B8A7E]">Ordenado por nivel de interés</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead className="text-[11px] text-[#8B8A7E] uppercase tracking-wider">
            <tr className="border-b border-[#F2EFE8]">
              <th className="text-left px-6 py-3">Campo</th>
              <th className="text-right px-3 py-3">Visitas</th>
              <th className="text-right px-3 py-3">Consultas</th>
              <th className="text-right px-3 py-3">Leads</th>
              <th className="text-right px-3 py-3">Días</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const hot = c.visitas >= 50 && c.consultas >= 3
              const cold = (c.diasPublicado ?? 0) > 120 && c.consultas === 0
              return (
                <tr key={c.id} className="border-b border-[#F7F5F0] hover:bg-[#F9F8F5]/60 transition-colors">
                  <td className="px-6 py-3">
                    <Link href={`/dashboard/campos/${c.id}/estadisticas`} className="font-medium text-[#1A1A12] hover:text-[#2D5018]">
                      {c.titulo}
                    </Link>
                  </td>
                  <td className="text-right px-3 py-3 tabular-nums">{c.visitas}</td>
                  <td className="text-right px-3 py-3 tabular-nums">{c.consultas}</td>
                  <td className="text-right px-3 py-3 tabular-nums">{c.leads}</td>
                  <td className="text-right px-3 py-3 tabular-nums text-[#8B8A7E]">{c.diasPublicado ?? '—'}</td>
                  <td className="px-3 py-3 text-center">
                    {hot && <Flame className="h-4 w-4 text-orange-500 inline" />}
                    {cold && <Snowflake className="h-4 w-4 text-blue-400 inline" />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
