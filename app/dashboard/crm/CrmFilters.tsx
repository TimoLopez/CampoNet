'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Campo } from '@/lib/types'
import { SlidersHorizontal } from 'lucide-react'

interface Props {
  campos: Pick<Campo, 'id' | 'titulo'>[]
}

export default function CrmFilters({ campos }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const estadoFilter = searchParams.get('estado') ?? 'todos'
  const campoFilter = searchParams.get('campo') ?? 'todos'
  const hasFilters = estadoFilter !== 'todos' || campoFilter !== 'todos'

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'todos') params.delete(key)
    else params.set(key, value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  function clearAll() {
    router.replace(pathname)
  }

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="flex items-center gap-1.5 text-[12px] text-[#8B8A7E] mr-0.5">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Filtrar</span>
      </div>

      <Select value={estadoFilter} onValueChange={v => v && update('estado', v)}>
        <SelectTrigger className="h-9 w-[160px] text-[12.5px] rounded-xl border-[#E2DFD6] bg-white hover:border-[#C49A3C]/40 transition-colors cursor-pointer">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value="nuevo">Nuevo</SelectItem>
          <SelectItem value="contactado">Contactado</SelectItem>
          <SelectItem value="negociacion">Negociación</SelectItem>
          <SelectItem value="cerrado">Cerrado</SelectItem>
          <SelectItem value="descartado">Descartado</SelectItem>
        </SelectContent>
      </Select>

      {campos.length > 0 && (
        <Select value={campoFilter} onValueChange={v => v && update('campo', v)}>
          <SelectTrigger className="h-9 w-[200px] text-[12.5px] rounded-xl border-[#E2DFD6] bg-white hover:border-[#C49A3C]/40 transition-colors cursor-pointer">
            <SelectValue placeholder="Todos los campos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los campos</SelectItem>
            {campos.map(c => (
              <SelectItem key={c.id} value={c.id} className="truncate max-w-[250px]">
                {c.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-[12px] text-[#8B6914] hover:text-[#C49A3C] font-medium transition-colors duration-150 cursor-pointer underline underline-offset-2"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
