'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Campo } from '@/lib/types'

interface Props {
  campos: Pick<Campo, 'id' | 'titulo'>[]
}

export default function CrmFilters({ campos }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const estadoFilter = searchParams.get('estado') ?? 'todos'
  const campoFilter = searchParams.get('campo') ?? 'todos'

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'todos') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select
        value={estadoFilter}
        onValueChange={v => v && update('estado', v)}
      >
        <SelectTrigger className="w-44 h-8 text-sm">
          <SelectValue placeholder="Todos los estados" />
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

      <Select
        value={campoFilter}
        onValueChange={v => v && update('campo', v)}
      >
        <SelectTrigger className="w-52 h-8 text-sm">
          <SelectValue placeholder="Todos los campos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los campos</SelectItem>
          {campos.map(c => (
            <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
