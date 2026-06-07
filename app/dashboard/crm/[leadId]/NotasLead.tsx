'use client'

import { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

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
      setTimeout(() => setStatus('idle'), 2000)
    }, 1500)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#1A1A12]">Notas internas</label>
        {status === 'saving' && <span className="text-xs text-[#5C5B4F]">Guardando...</span>}
        {status === 'saved' && <span className="text-xs text-[#2D5018]">Guardado ✓</span>}
      </div>
      <Textarea
        value={notas}
        onChange={e => handleChange(e.target.value)}
        placeholder="Notas privadas sobre este lead..."
        rows={5}
        className="resize-none"
      />
    </div>
  )
}
