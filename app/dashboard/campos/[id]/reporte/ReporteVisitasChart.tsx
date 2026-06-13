import type { VisitasDiaData } from '@/lib/dal/visitas'

interface Props {
  data: VisitasDiaData[]
  totalVisitas: number
}

export default function ReporteVisitasChart({ data, totalVisitas }: Props) {
  const isEmpty = totalVisitas === 0

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)] print:shadow-none print:break-inside-avoid">
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
        <Chart data={data} />
      )}
    </div>
  )
}

function Chart({ data }: { data: VisitasDiaData[] }) {
  const W = 720
  const H = 180
  const padX = 8
  const padTop = 8
  const padBottom = 22
  const chartW = W - padX * 2
  const chartH = H - padTop - padBottom

  const maxVisitas = Math.max(...data.map(d => d.visitas), 1)
  const gap = 4
  const n = data.length
  const barW = (chartW - (n - 1) * gap) / n

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto block"
      role="img"
      aria-label="Visitas últimos 30 días"
    >
      {data.map((d, i) => {
        const h = (d.visitas / maxVisitas) * chartH
        const x = padX + i * (barW + gap)
        const y = padTop + (chartH - h)
        return (
          <rect
            key={`bar-${i}`}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={3}
            fill="#1C3311"
          />
        )
      })}
      {data.map((d, i) => {
        if (i % 5 !== 0) return null
        const x = padX + i * (barW + gap) + barW / 2
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={H - 6}
            textAnchor="middle"
            fontSize="11"
            fill="#8B8A7E"
          >
            {d.fecha}
          </text>
        )
      })}
    </svg>
  )
}
