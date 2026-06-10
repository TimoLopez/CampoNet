'use client'

import { Clock, MessageSquare, Eye, FileText } from 'lucide-react'

export type TimelineEvent =
  | { type: 'consulta'; date: string; nombre: string; mensaje: string }
  | { type: 'visita';   date: string }
  | { type: 'nota';     date: string; texto: string }

interface LeadTimelineProps {
  events: TimelineEvent[]
  campoTitulo: string | null
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'hace 1 día'
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 14) return 'hace 1 semana'
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`

  // Absolute for older events
  return date.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function EventIcon({ type }: { type: TimelineEvent['type'] }) {
  if (type === 'consulta') {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#1C3311]/10 flex items-center justify-center shrink-0">
        <MessageSquare className="h-3.5 w-3.5 text-[#1C3311]" />
      </div>
    )
  }
  if (type === 'visita') {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#C49A3C]/10 flex items-center justify-center shrink-0">
        <Eye className="h-3.5 w-3.5 text-[#8B6914]" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-[#F2EFE8] flex items-center justify-center shrink-0">
      <FileText className="h-3.5 w-3.5 text-[#5C5B4F]" />
    </div>
  )
}

function EventText({
  event,
  campoTitulo,
}: {
  event: TimelineEvent
  campoTitulo: string | null
}) {
  if (event.type === 'consulta') {
    return (
      <div>
        <p className="text-[13.5px] text-[#1A1A12]">
          Envió una consulta{campoTitulo ? ` sobre ${campoTitulo}` : ''}
        </p>
        {event.mensaje && event.mensaje !== '(sin mensaje)' && (
          <p className="text-[12.5px] text-[#5C5B4F] mt-1 leading-relaxed line-clamp-3">
            "{event.mensaje}"
          </p>
        )}
      </div>
    )
  }
  if (event.type === 'visita') {
    return (
      <p className="text-[13.5px] text-[#1A1A12]">Visitó la ficha del campo</p>
    )
  }
  return (
    <p className="text-[13.5px] text-[#5C5B4F] line-clamp-3 leading-relaxed">
      {event.texto}
    </p>
  )
}

export default function LeadTimeline({ events, campoTitulo }: LeadTimelineProps) {
  if (events.length === 0) return null

  const singleEvent = events.length <= 1

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-[13.5px] font-semibold text-[#1A1A12] mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-[#C49A3C] inline-block" />
        Actividad
        <Clock className="h-3.5 w-3.5 text-[#8B8A7E] ml-0.5" />
      </h2>

      <div className="space-y-0">
        {events.map((event, index) => {
          const isLast = index === events.length - 1
          return (
            <div key={`${event.type}-${event.date}-${index}`} className="flex gap-3">
              {/* Left column: icon + connector line */}
              <div className="flex flex-col items-center">
                <EventIcon type={event.type} />
                {!singleEvent && !isLast && (
                  <div className="w-px flex-1 bg-[#E2DFD6] my-1" />
                )}
              </div>

              {/* Right column: text + date */}
              <div className={`flex-1 min-w-0 flex items-start justify-between gap-3 ${!isLast ? 'pb-4' : ''}`}>
                <EventText event={event} campoTitulo={campoTitulo} />
                <span className="text-[11.5px] text-[#8B8A7E] shrink-0 tabular-nums mt-0.5">
                  {formatRelative(event.date)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
