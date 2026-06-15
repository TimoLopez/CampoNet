'use client'

import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react'

type EstadoActivo = 'nuevo' | 'contactado' | 'negociacion'

type OtroLead = {
  id: string
  nombre: string
  estado: EstadoActivo
}

const ESTADO_LABEL: Record<EstadoActivo, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  negociacion: 'En negociación',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string
  leadNombre: string
  campoId: string | null
  campoTitulo: string | null
  onSuccess: () => void
}

export default function CerrarLeadDialog({
  open,
  onOpenChange,
  leadId,
  leadNombre,
  campoId,
  campoTitulo,
  onSuccess,
}: Props) {
  const [loadingOtros, setLoadingOtros] = useState(false)
  const [otros, setOtros] = useState<OtroLead[]>([])
  const [descartarIds, setDescartarIds] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  // Cargar otros leads activos del mismo campo cuando se abre el dialog
  useEffect(() => {
    if (!open || !campoId) {
      setOtros([])
      setDescartarIds(new Set())
      return
    }

    setLoadingOtros(true)
    const supabase = createClient()
    supabase
      .from('leads')
      .select('id, nombre, estado')
      .eq('campo_id', campoId)
      .neq('id', leadId)
      .in('estado', ['nuevo', 'contactado', 'negociacion'])
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error('Error cargando los otros leads.')
          setOtros([])
        } else {
          const list = (data ?? []) as OtroLead[]
          setOtros(list)
          // Por default, marcar todos como "descartar"
          setDescartarIds(new Set(list.map(l => l.id)))
        }
        setLoadingOtros(false)
      })
  }, [open, campoId, leadId])

  function toggle(id: string) {
    const next = new Set(descartarIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setDescartarIds(next)
  }

  async function confirmar() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/cerrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descartarLeadIds: Array.from(descartarIds) }),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(json.error ?? 'Error al cerrar el lead.')
        setSubmitting(false)
        return
      }

      const parts: string[] = ['Lead marcado como cerrado.']
      if (json.campoMarcadoVendido) parts.push('Campo marcado como vendido.')
      if (json.leadsDescartados > 0) {
        parts.push(`${json.leadsDescartados} ${json.leadsDescartados === 1 ? 'lead descartado' : 'leads descartados'}.`)
      }
      toast.success(parts.join(' '))

      onOpenChange(false)
      onSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-[#1A1A12] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Marcar lead como cerrado
          </DialogTitle>
          <DialogDescription className="text-[12.5px] text-[#5C5B4F] leading-relaxed pt-1">
            Vas a marcar a <strong className="text-[#1A1A12]">{leadNombre}</strong> como cerrado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Info del campo */}
          {campoId && campoTitulo ? (
            <div className="bg-[#F9F8F5] border border-[#E2DFD6] rounded-xl p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1C3311]/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-[#2D5018]" />
                </div>
                <div>
                  <p className="text-[12.5px] text-[#5C5B4F]">
                    El campo <strong className="text-[#1A1A12]">{campoTitulo}</strong> se va a marcar como <strong className="text-emerald-700">vendido</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-800">
                  Este lead no tiene un campo asociado. Solo se va a actualizar el estado del lead.
                </p>
              </div>
            </div>
          )}

          {/* Otros leads del mismo campo */}
          {campoId && (
            <div>
              <p className="text-[12px] font-semibold text-[#1A1A12] mb-2">
                Otros leads activos en este campo
              </p>

              {loadingOtros ? (
                <div className="flex items-center gap-2 text-[12px] text-[#8B8A7E] py-3">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Cargando…
                </div>
              ) : otros.length === 0 ? (
                <p className="text-[12px] text-[#8B8A7E] py-2">
                  No hay otros leads activos en este campo.
                </p>
              ) : (
                <div className="space-y-2">
                  {otros.map(l => (
                    <label
                      key={l.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E2DFD6] hover:bg-[#F9F8F5] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={descartarIds.has(l.id)}
                        onChange={() => toggle(l.id)}
                        className="h-4 w-4 rounded border-[#C2BFB5] text-[#1C3311] focus:ring-[#C49A3C] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-medium text-[#1A1A12] truncate">{l.nombre}</p>
                        <p className="text-[11px] text-[#8B8A7E]">{ESTADO_LABEL[l.estado]}</p>
                      </div>
                    </label>
                  ))}
                  <p className="text-[11px] text-[#8B8A7E] pt-1">
                    Los marcados van a pasar a estado <strong>descartado</strong>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={confirmar}
            disabled={submitting || loadingOtros}
            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            {submitting ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Procesando…</>
            ) : (
              'Confirmar cierre'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
