'use client'

import { useState } from 'react'
import { Check, X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const PREDEFINED = [
  'Vivienda',
  'Galpón',
  'Corrales',
  'Manga y bañadero',
  'Silo',
  'Molino',
  'Energía eléctrica',
  'Sistema de riego',
  'Caminos internos',
  'Acceso a puerto',
  'Frigorífico cercano',
  'Planta industrial',
]

interface Props {
  value: string[]
  onChange: (v: string[]) => void
}

export default function CampoCaracteristicas({ value, onChange }: Props) {
  const [custom, setCustom] = useState('')

  function toggle(item: string) {
    onChange(value.includes(item) ? value.filter(v => v !== item) : [...value, item])
  }

  function addCustom() {
    const trimmed = custom.trim()
    if (!trimmed || value.includes(trimmed)) { setCustom(''); return }
    onChange([...value, trimmed])
    setCustom('')
  }

  const customItems = value.filter(v => !PREDEFINED.includes(v))

  return (
    <div className="space-y-4">
      {/* Predefined options — fixed positions, toggled in/out */}
      <div className="flex flex-wrap gap-2">
        {PREDEFINED.map(item => {
          const selected = value.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-medium border transition-all duration-150 cursor-pointer select-none ${
                selected
                  ? 'bg-[#1C3311] border-[#1C3311] text-white shadow-[0_2px_8px_-2px_rgba(28,51,17,.3)]'
                  : 'bg-white border-[#E2DFD6] text-[#5C5B4F] hover:border-[#C49A3C]/50 hover:text-[#1A1A12] hover:bg-[#F7F5F0]'
              }`}
            >
              {selected && <Check className="h-3 w-3 shrink-0" />}
              {item}
            </button>
          )
        })}
      </div>

      {/* Custom items added by the user */}
      {customItems.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#F7F5F0]">
          {customItems.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-medium bg-[#C49A3C]/12 border border-[#C49A3C]/30 text-[#8B6914]"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(value.filter(v => v !== item))}
                className="hover:text-[#1A1A12] transition-colors"
                aria-label={`Quitar ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add custom characteristic */}
      <div className="flex items-center gap-2">
        <Input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); addCustom() }
          }}
          placeholder="Agregar otra característica..."
          className="h-9 text-[13px] rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-[#1A1A12] placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="h-9 px-3 rounded-xl border-[#E2DFD6] text-[#5C5B4F] hover:border-[#C49A3C]/40 hover:bg-[#F7F5F0] transition-all shrink-0 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
