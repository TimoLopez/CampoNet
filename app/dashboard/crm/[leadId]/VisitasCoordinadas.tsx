'use client'

import { useState } from 'react'
import { CalendarClock, Plus, Check, X, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { VisitaCoordinada } from '@/lib/types'

const ESTADO_CONFIG: Record<VisitaCoordinada['estado'], { label: string; className: string }> = {
  programada: { label: 'Programada', className: 'bg-blue-50 text-blue-700 border-blue-200/80' },
  realizada:  { label: 'Realizada',  className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' },
  cancelada:  { label: 'Cancelada',  className: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-UY', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface Props {
  leadId: string
  campoId: string | null
  escritorioId: string
  initialVisitas: VisitaCoordinada[]
}

export default function VisitasCoordinadas({ leadId, campoId, escritorioId, initialVisitas }: Props) {
  const [visitas, setVisitas] = useState(initialVisitas)
  const [fechaHora, setFechaHora] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function handleAgendar() {
    if (!fechaHora) {
      toast.error('Elegí una fecha y hora.')
      return
    }
    if (!campoId) {
      toast.error('Este lead no tiene un campo asociado.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('visitas_coordinadas')
      .insert({
        lead_id: leadId,
        campo_id: campoId,
        escritorio_id: escritorioId,
        fecha_hora: new Date(fechaHora).toISOString(),
        notas: notas || null,
      })
      .select('*')
      .single()
    setLoading(false)
    if (error || !data) {
      toast.error('Error al agendar la visita.')
      return
    }
    setVisitas(prev =>
      [...prev, data as VisitaCoordinada].sort(
        (a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
      )
    )
    setFechaHora('')
    setNotas('')
    toast.success('Visita agendada.')
  }

  async function handleEstado(id: string, estado: 'realizada' | 'cancelada') {
    setUpdatingId(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('visitas_coordinadas')
      .update({ estado })
      .eq('id', id)
    setUpdatingId(null)
    if (error) {
      toast.error('Error al actualizar la visita.')
      return
    }
    setVisitas(prev => prev.map(v => (v.id === id ? { ...v, estado } : v)))
    toast.success(estado === 'realizada' ? 'Visita marcada como realizada.' : 'Visita cancelada.')
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F7F5F0] bg-[#F9F8F5]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#F2EFE8] flex items-center justify-center">
            <CalendarClock className="h-3.5 w-3.5 text-[#8B6914]" />
          </div>
          <span className="text-[13.5px] font-semibold text-[#1A1A12]">Visitas coordinadas</span>
        </div>
        <span className="text-[12px] text-[#8B8A7E] tabular-nums">
          {visitas.length} visita{visitas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {visitas.length === 0 ? (
        <p className="text-[13px] text-[#8B8A7E] px-6 py-6">Sin visitas coordinadas todavía.</p>
      ) : (
        <div className="divide-y divide-[#F7F5F0]">
          {visitas.map(v => {
            const config = ESTADO_CONFIG[v.estado]
            return (
              <div key={v.id} className="flex items-center justify-between px-6 py-3.5 gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] text-[#1A1A12] font-medium">{formatDateTime(v.fecha_hora)}</p>
                  {v.notas && <p className="text-[12px] text-[#8B8A7E] mt-0.5 truncate">{v.notas}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-[11px] font-semibold border px-2 py-0.5 rounded-full', config.className)}>
                    {config.label}
                  </span>
                  {v.estado === 'programada' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEstado(v.id, 'realizada')}
                        disabled={updatingId === v.id}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
                        title="Marcar como realizada"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEstado(v.id, 'cancelada')}
                        disabled={updatingId === v.id}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        title="Cancelar"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New visit form */}
      <div className="px-6 py-4 border-t border-[#F7F5F0] bg-[#F9F8F5] space-y-3">
        {!campoId ? (
          <p className="text-[12.5px] text-[#8B8A7E] flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            Este lead no tiene un campo asociado — no se puede agendar una visita.
          </p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="datetime-local"
                value={fechaHora}
                onChange={e => setFechaHora(e.target.value)}
                className="flex-1 h-9 rounded-lg border border-[#E2DFD6] bg-white px-3 text-[13px] text-[#1A1A12] focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/20 focus:border-[#C49A3C]"
              />
              <input
                type="text"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Notas (opcional)"
                className="flex-1 h-9 rounded-lg border border-[#E2DFD6] bg-white px-3 text-[13px] text-[#1A1A12] placeholder:text-[#C2BFB5] focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/20 focus:border-[#C49A3C]"
              />
            </div>
            <button
              type="button"
              onClick={handleAgendar}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#1C3311] hover:bg-[#254516] px-3.5 py-2 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Agendar visita
            </button>
          </>
        )}
      </div>
    </div>
  )
}
