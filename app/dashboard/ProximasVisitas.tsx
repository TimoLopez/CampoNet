import Link from 'next/link'
import { CalendarClock, ArrowRight } from 'lucide-react'
import { getProximasVisitas } from '@/lib/dal/visitas-coordinadas'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-UY', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default async function ProximasVisitas({ escritorioId }: { escritorioId: string }) {
  const visitas = await getProximasVisitas(escritorioId)
  if (visitas.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#F2EFE8] bg-[#F9F8F5]">
        <div className="w-7 h-7 rounded-lg bg-[#F2EFE8] flex items-center justify-center">
          <CalendarClock className="h-4 w-4 text-[#8B6914]" />
        </div>
        <div>
          <h2 className="font-semibold text-[#1A1A12] text-[13.5px]">Próximas visitas</h2>
          <p className="text-[11px] text-[#8B8A7E] leading-none mt-0.5">
            {visitas.length} agendada{visitas.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <ul className="divide-y divide-[#F7F5F0]">
        {visitas.map(v => (
          <li key={v.id}>
            <Link
              href={`/dashboard/crm/${v.lead_id}`}
              className="group flex items-center justify-between px-5 py-3.5 hover:bg-[#F9F8F5] transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium text-[#1A1A12] truncate">{v.lead_nombre}</p>
                {v.campo_titulo && (
                  <p className="text-[11px] text-[#8B8A7E] truncate">{v.campo_titulo}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-[11px] text-[#8B6914] font-semibold bg-[#F2EFE8] px-2 py-0.5 rounded-full tabular-nums">
                  {formatDateTime(v.fecha_hora)}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#C2BFB5] group-hover:text-[#C49A3C] group-hover:translate-x-0.5 transition-all duration-150" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
