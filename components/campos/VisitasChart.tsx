'use client'

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { VisitasDiaData } from '@/lib/dal/visitas'

interface VisitasChartProps {
  data: VisitasDiaData[]
  totalVisitas: number
}

export default function VisitasChart({ data, totalVisitas }: VisitasChartProps) {
  const isEmpty = totalVisitas === 0

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)] print:break-inside-avoid print:shadow-none overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#1A1A12]">Visitas últimos 30 días</h2>
        <span className="inline-flex items-center rounded-full bg-[#F0EDE6] px-2.5 py-0.5 text-xs font-medium text-[#1A1A12]">
          {totalVisitas} total
        </span>
      </div>

      {isEmpty ? (
        <div className="flex h-[160px] items-center justify-center text-sm text-[#8B8A7E]">
          Sin visitas en este período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160} minWidth={400}>
          <BarChart data={data} barCategoryGap="30%">
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: '#8B8A7E' }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #E2DFD6',
                borderRadius: 8,
                fontSize: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              cursor={{ fill: '#F0EDE6' }}
              formatter={(value) => [value, 'visitas']}
            />
            <Bar dataKey="visitas" fill="#1C3311" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
