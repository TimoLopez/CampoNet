import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MessageSquare, Flame, MapPin, Calendar, Clock } from 'lucide-react'
import NotasLead from './NotasLead'
import LeadTimeline, { type TimelineEvent } from './LeadTimeline'
import { getLeadById } from '@/lib/dal/leads'
import { getVisitasForLead } from '@/lib/dal/visitas'
import { getConsultasForLead } from '@/lib/dal/consultas'
import type { Consulta } from '@/lib/types'

const ESTADO_CONFIG: Record<string, { label: string; dot: string; className: string }> = {
  nuevo:       { label: 'Nuevo',       dot: 'bg-blue-500',   className: 'bg-blue-50 text-blue-700 border-blue-200/80' },
  contactado:  { label: 'Contactado',  dot: 'bg-amber-500',  className: 'bg-amber-50 text-amber-700 border-amber-200/80' },
  negociacion: { label: 'Negociación', dot: 'bg-violet-500', className: 'bg-violet-50 text-violet-700 border-violet-200/80' },
  cerrado:     { label: 'Cerrado',     dot: 'bg-emerald-500',className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' },
  descartado:  { label: 'Descartado',  dot: 'bg-zinc-400',   className: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-UY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleString('es-UY', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

export default async function LeadDetailPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const lead = await getLeadById(leadId, user!.id)
  if (!lead) notFound()

  const visitas = await getVisitasForLead(leadId)
  const consultas = await getConsultasForLead(leadId)
  const cutoffDays = 14
  const cutoff = new Date(Date.now() - cutoffDays * 24 * 60 * 60 * 1000)
  const esCaliente = visitas.filter(v => new Date(v.created_at) > cutoff).length >= 3

  const campoPerdido = !lead.campo_titulo && lead.campo_titulo_snapshot
  const estadoConfig = ESTADO_CONFIG[lead.estado] ?? ESTADO_CONFIG.nuevo

  // Parse manually added notes (written by the escritorio, format: [DD/MM/YYYY] texto)
  const notaEvents: TimelineEvent[] = (lead.notas ?? '')
    .split(/\n\n(?=\[)/)
    .filter((chunk: string) => /^\[\d{2}\/\d{2}\/\d{4}\]/.test(chunk))
    .map((chunk: string): TimelineEvent | null => {
      const match = chunk.match(/^\[(\d{2})\/(\d{2})\/(\d{4})\]\s*([\s\S]*)$/)
      if (!match) return null
      const [, dd, mm, yyyy, texto] = match
      return { type: 'nota' as const, date: `${yyyy}-${mm}-${dd}T00:00:00.000Z`, texto: texto.trim() }
    })
    .filter((e): e is TimelineEvent => e !== null)

  const timelineEvents: TimelineEvent[] = [
    ...consultas.map((c: Consulta) => ({
      type: 'consulta' as const,
      date: c.created_at,
      nombre: lead.nombre,
      mensaje: c.mensaje,
    })),
    ...visitas.map(v => ({ type: 'visita' as const, date: v.created_at })),
    ...notaEvents,
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6 max-w-2xl animate-fade-up">

      {/* Back nav */}
      <div>
        <Link
          href="/dashboard/crm"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#8B8A7E] hover:text-[#1A1A12] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
          Volver a leads
        </Link>
      </div>

      {/* Hero header */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-[#1C3311] flex items-center justify-center text-[#C49A3C] text-[15px] font-bold shrink-0">
            {initials(lead.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[22px] font-bold text-[#1A1A12] tracking-tight">{lead.nombre}</h1>
              {esCaliente && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-50 text-orange-600 border border-orange-200/80 px-2 py-0.5 rounded-full">
                  <Flame className="h-3 w-3" />
                  Caliente
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold border px-2.5 py-1 rounded-full ${estadoConfig.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${estadoConfig.dot}`} />
                {estadoConfig.label}
              </span>
              {lead.campo_titulo && (
                <span className="flex items-center gap-1.5 text-[12.5px] text-[#8B8A7E]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {lead.campo_titulo}{lead.campo_departamento ? ` · ${lead.campo_departamento}` : ''}
                </span>
              )}
              {campoPerdido && (
                <span className="flex items-center gap-1.5 text-[12.5px] text-[#8B8A7E]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{lead.campo_titulo_snapshot}</span>
                  <span className="text-[11px] text-red-400 font-medium">(campo eliminado)</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-[13.5px] font-semibold text-[#1A1A12] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#C49A3C] inline-block" />
          Datos de contacto
        </h2>
        <div className="space-y-3">
          {lead.email && (
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-[#F2EFE8] flex items-center justify-center shrink-0">
                <Mail className="h-3.5 w-3.5 text-[#8B6914]" />
              </div>
              <a
                href={`mailto:${lead.email}`}
                className="text-[13.5px] text-[#5C5B4F] hover:text-[#1C3311] hover:underline underline-offset-2 transition-colors"
              >
                {lead.email}
              </a>
            </div>
          )}
          {lead.telefono && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F2EFE8] flex items-center justify-center shrink-0">
                <Phone className="h-3.5 w-3.5 text-[#8B6914]" />
              </div>
              <a
                href={`tel:${lead.telefono}`}
                className="text-[13.5px] text-[#5C5B4F] hover:text-[#1C3311] hover:underline underline-offset-2 transition-colors"
              >
                {lead.telefono}
              </a>
            </div>
          )}
          {lead.mensaje && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F2EFE8] flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="h-3.5 w-3.5 text-[#8B6914]" />
              </div>
              <p className="text-[13.5px] text-[#5C5B4F] leading-relaxed">{lead.mensaje}</p>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2 border-t border-[#F7F5F0] mt-2">
            <div className="w-8 h-8 rounded-lg bg-[#F2EFE8] flex items-center justify-center shrink-0">
              <Calendar className="h-3.5 w-3.5 text-[#8B6914]" />
            </div>
            <p className="text-[12.5px] text-[#8B8A7E]">
              Consultó el {formatDate(lead.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <LeadTimeline
        events={timelineEvents}
        campoTitulo={lead.campo_titulo ?? lead.campo_titulo_snapshot ?? null}
      />

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
        <NotasLead leadId={leadId} initialNotas={lead.notas} />
      </div>

      {/* Visit history */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[var(--shadow-card)] overflow-hidden">
        <div className={`flex items-center justify-between px-6 py-4 border-b border-[#F7F5F0] ${esCaliente ? 'bg-gradient-to-r from-orange-50/70 to-transparent' : 'bg-[#F9F8F5]'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${esCaliente ? 'bg-orange-100' : 'bg-[#F2EFE8]'}`}>
              <Clock className={`h-3.5 w-3.5 ${esCaliente ? 'text-orange-500' : 'text-[#8B6914]'}`} />
            </div>
            <div>
              <span className="text-[13.5px] font-semibold text-[#1A1A12]">Historial de visitas</span>
              {esCaliente && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-orange-600 font-medium">
                  <Flame className="h-3 w-3" /> Lead caliente
                </span>
              )}
            </div>
          </div>
          <span className="text-[12px] text-[#8B8A7E] tabular-nums">
            {visitas?.length ?? 0} visita{(visitas?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>

        {(!visitas || visitas.length === 0) ? (
          <p className="text-[13px] text-[#8B8A7E] px-6 py-6">Sin historial de visitas registrado.</p>
        ) : (
          <div className="divide-y divide-[#F7F5F0]">
            {visitas.map(v => {
              const isRecent = new Date(v.created_at) > cutoff
              return (
                <div key={v.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isRecent ? 'bg-orange-400' : 'bg-[#D8D5CC]'}`} />
                    <p className="text-[13px] text-[#1A1A12]">{formatShort(v.created_at)}</p>
                  </div>
                  {isRecent && (
                    <span className="text-[11px] text-orange-500 font-semibold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                      últimos 14 días
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
