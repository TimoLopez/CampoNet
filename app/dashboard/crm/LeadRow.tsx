'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, ArrowRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type EstadoLead = 'nuevo' | 'contactado' | 'negociacion' | 'cerrado' | 'descartado'

const ESTADO_STYLE: Record<EstadoLead, string> = {
  nuevo:       'bg-blue-50 text-blue-700 border-blue-200',
  contactado:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  negociacion: 'bg-purple-50 text-purple-700 border-purple-200',
  cerrado:     'bg-green-50 text-green-700 border-green-200',
  descartado:  'bg-gray-100 text-gray-500 border-gray-200',
}

const ESTADO_LABEL: Record<EstadoLead, string> = {
  nuevo: 'Nuevo', contactado: 'Contactado', negociacion: 'Negociación',
  cerrado: 'Cerrado', descartado: 'Descartado',
}

interface Props {
  lead: {
    id: string
    nombre: string
    estado: EstadoLead
    created_at: string
    campo_titulo: string | null
    total_visitas: number
    ultima_visita: string | null
    es_caliente: boolean
  }
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

export default function LeadRow({ lead }: Props) {
  const [estado, setEstado] = useState<EstadoLead>(lead.estado)

  async function handleEstado(value: EstadoLead) {
    setEstado(value)
    const supabase = createClient()
    const { error } = await supabase.from('leads').update({ estado: value }).eq('id', lead.id)
    if (error) {
      setEstado(lead.estado)
      toast.error('Error al cambiar el estado.')
    }
  }

  return (
    <tr className={`border-b border-[#F2EFE8] hover:bg-[#F7F5F0] transition-colors ${estado === 'nuevo' ? 'bg-blue-50/40' : 'bg-white'}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {lead.es_caliente && <Flame className="h-4 w-4 text-orange-500 shrink-0" />}
          <div>
            <p className="font-medium text-[#1A1A12] text-sm">{lead.nombre}</p>
            {lead.campo_titulo && (
              <p className="text-xs text-[#5C5B4F] truncate max-w-[200px]">{lead.campo_titulo}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Select value={estado} onValueChange={handleEstado}>
          <SelectTrigger className={`h-7 w-36 text-xs border ${ESTADO_STYLE[estado]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ESTADO_LABEL) as EstadoLead[]).map(e => (
              <SelectItem key={e} value={e} className="text-xs">{ESTADO_LABEL[e]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3 text-sm text-[#5C5B4F]">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-[#1A1A12]">{lead.total_visitas}</span>
          {lead.ultima_visita && (
            <span className="text-xs">· {relativeTime(lead.ultima_visita)}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-[#5C5B4F]">
        {relativeTime(lead.created_at)}
      </td>
      <td className="px-4 py-3">
        <Link href={`/dashboard/crm/${lead.id}`} className="text-[#5C5B4F] hover:text-[#1C3311] cursor-pointer">
          <ArrowRight className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  )
}
