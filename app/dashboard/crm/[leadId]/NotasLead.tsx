'use client'

import { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Check, StickyNote } from 'lucide-react'

interface Props {
  leadId: string
  initialNotas: string | null
}

export default function NotasLead({ leadId, initialNotas }: Props) {
  const [notas, setNotas] = useState(initialNotas ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function handleChange(value: string) {
    setNotas(value)
    setStatus('saving')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const supabase = createClient()
      await supabase.from('leads').update({ notas: value || null }).eq('id', leadId)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    }, 1500)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F2EFE8] flex items-center justify-center">
            <StickyNote className="h-3.5 w-3.5 text-[#8B6914]" />
          </div>
          <span className="text-[13.5px] font-semibold text-[#1A1A12]">Notas internas</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11.5px] min-w-[80px] justify-end">
          {status === 'saving' && (
            <span className="flex items-center gap-1 text-[#8B8A7E]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Guardando...
            </span>
          )}
          {status === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Check className="h-3 w-3" />
              Guardado
            </span>
          )}
        </div>
      </div>
      <Textarea
        value={notas}
        onChange={e => handleChange(e.target.value)}
        placeholder="Anotá detalles de conversaciones, preferencias del comprador, próximos pasos..."
        rows={5}
        className="resize-none rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-sm text-[#1A1A12] placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150 leading-relaxed"
      />
    </div>
  )
}
