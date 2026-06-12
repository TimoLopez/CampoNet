'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, ArrowRight, Eye } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type EstadoLead = 'nuevo' | 'contactado' | 'negociacion' | 'cerrado' | 'descartado'

const ESTADO_CONFIG: Record<EstadoLead, { label: string; dot: string; className: string }> = {
  nuevo:       { label: 'Nuevo',       dot: 'bg-blue-500',   className: 'bg-blue-50 text-blue-700 border-blue-200/80' },
  contactado:  { label: 'Contactado',  dot: 'bg-amber-500',  className: 'bg-amber-50 text-amber-700 border-amber-200/80' },
  negociacion: { label: 'Negociación', dot: 'bg-violet-500', className: 'bg-violet-50 text-violet-700 border-violet-200/80' },
  cerrado:     { label: 'Cerrado',     dot: 'bg-emerald-500',className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' },
  descartado:  { label: 'Descartado',  dot: 'bg-zinc-400',   className: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
}

interface Props {
  lead: {
    id: string
    nombre: string
    estado: EstadoLead
    created_at: string
    campo_id: string | null
    campo_titulo: string | null
    campo_titulo_snapshot: string | null
    total_visitas: number
    ultima_visita: string | null
    es_caliente: boolean
    score: number | null
    score_categoria: 'frio' | 'tibio' | 'caliente' | null
  }
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d`
  return new Date(iso).toLocaleDateString('es-UY', { day: '2-digit', month: 'short' })
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

const avatarColors = [
  'bg-[#1C3311] text-[#C49A3C]',
  'bg-[#2D3B8B] text-blue-200',
  'bg-[#7C2D6B] text-pink-200',
  'bg-[#1A5C4E] text-teal-200',
  'bg-[#5C3A1A] text-orange-200',
]

function avatarColor(id: string) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return avatarColors[sum % avatarColors.length]
}

export default function LeadRow({ lead }: Props) {
  const [estado, setEstado] = useState<EstadoLead>(lead.estado)
  const config = ESTADO_CONFIG[estado]

  async function handleEstado(value: EstadoLead) {
    const prev = estado
    setEstado(value)
    const supabase = createClient()
    const { error } = await supabase.from('leads').update({ estado: value }).eq('id', lead.id)
    if (error) {
      setEstado(prev)
      toast.error('Error al cambiar el estado.')
    }
  }

  return (
    <tr className={cn(
      'group relative border-b border-[#F7F5F0] transition-colors duration-100',
      'hover:bg-[#F9F8F5]',
      lead.es_caliente && 'border-l-2 border-l-orange-400/50',
    )}>

      {/* Lead name + campo */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold',
            avatarColor(lead.id),
          )}>
            {initials(lead.nombre)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13.5px] font-semibold text-[#1A1A12] truncate max-w-[180px]">
                {lead.nombre}
              </p>
              {lead.es_caliente && (
                <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              )}
              {lead.score_categoria && (
                <span className={cn(
                  'text-[10px] font-semibold px-1.5 py-0.5 rounded-full border tabular-nums',
                  lead.score_categoria === 'caliente' && 'bg-red-50 text-red-600 border-red-200/80',
                  lead.score_categoria === 'tibio'    && 'bg-amber-50 text-amber-600 border-amber-200/80',
                  lead.score_categoria === 'frio'     && 'bg-sky-50 text-sky-600 border-sky-200/80',
                )}>
                  {lead.score}
                </span>
              )}
            </div>
            {(lead.campo_titulo || lead.campo_titulo_snapshot) && (
              <p className="text-[11px] text-[#8B8A7E] truncate max-w-[180px] mt-0.5 flex items-center gap-1">
                <span className="truncate">
                  {lead.campo_titulo ?? lead.campo_titulo_snapshot}
                </span>
                {!lead.campo_id && lead.campo_titulo_snapshot && (
                  <span className="shrink-0 text-[10px] text-red-400 font-medium">(eliminado)</span>
                )}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Estado (inline select) */}
      <td className="px-5 py-3.5">
        <Select value={estado} onValueChange={v => handleEstado(v as EstadoLead)}>
          <SelectTrigger className={cn(
            'h-7 w-36 text-[11.5px] font-semibold border rounded-full px-3 cursor-pointer focus:ring-0',
            config.className,
          )}>
            <div className="flex items-center gap-1.5">
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(ESTADO_CONFIG) as [EstadoLead, typeof config][]).map(([key, c]) => (
              <SelectItem key={key} value={key} className="text-xs">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full', c.dot)} />
                  {c.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Visitas */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 text-[#C2BFB5]" />
          <span className="text-[13px] font-semibold text-[#1A1A12] tabular-nums">{lead.total_visitas}</span>
          {lead.ultima_visita && (
            <span className="text-[11px] text-[#8B8A7E]">· {relativeTime(lead.ultima_visita)}</span>
          )}
        </div>
      </td>

      {/* Fecha consulta */}
      <td className="px-5 py-3.5 text-[12px] text-[#8B8A7E] tabular-nums">
        {relativeTime(lead.created_at)}
      </td>

      {/* Arrow link */}
      <td className="px-5 py-3.5">
        <Link
          href={`/dashboard/crm/${lead.id}`}
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[#C2BFB5] hover:text-[#C49A3C] hover:bg-[#F2EFE8] transition-all duration-150 cursor-pointer"
        >
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
        </Link>
      </td>
    </tr>
  )
}
