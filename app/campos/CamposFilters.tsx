'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'

const DEPARTAMENTOS = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
  'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
  'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto',
  'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres',
]

const TIPOS = [
  { value: 'ganadero',  label: 'Ganadero' },
  { value: 'agricola',  label: 'Agrícola' },
  { value: 'forestal',  label: 'Forestal' },
  { value: 'mixto',     label: 'Mixto' },
]

export default function CamposFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const get = (key: string) => searchParams.get(key) ?? ''

  const push = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/campos?${params.toString()}`)
    },
    [router, searchParams],
  )

  const hasFilters =
    get('departamento') || get('tipo') || get('precioMin') ||
    get('precioMax') || get('hectareasMin')

  const reset = () => router.push('/campos')

  const labelCls = 'block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B8A7E] mb-1.5'
  const selectCls =
    'w-full rounded-xl border border-[#E4E0D6] bg-white/80 px-3 py-2 text-[13px] text-[#1A1A12] focus:outline-none focus:ring-2 focus:ring-[#2D5018]/30 focus:border-[#2D5018]/50 transition'
  const inputCls =
    'w-full rounded-xl border border-[#E4E0D6] bg-white/80 px-3 py-2 text-[13px] text-[#1A1A12] placeholder-[#C8C6BB] focus:outline-none focus:ring-2 focus:ring-[#2D5018]/30 focus:border-[#2D5018]/50 transition'

  return (
    <div className="rounded-2xl border border-[#E4E0D6] bg-white/70 cn-glass p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1A1A12]">
          <SlidersHorizontal className="h-4 w-4 text-[#2D5018]" />
          Filtros
        </div>
        {hasFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-[11.5px] text-[#8B6914] hover:text-[#C49A3C] transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Departamento */}
      <div>
        <label className={labelCls}>Departamento</label>
        <select
          className={selectCls}
          value={get('departamento')}
          onChange={e => push('departamento', e.target.value)}
        >
          <option value="">Todos</option>
          {DEPARTAMENTOS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Tipo */}
      <div>
        <label className={labelCls}>Tipo de campo</label>
        <select
          className={selectCls}
          value={get('tipo')}
          onChange={e => push('tipo', e.target.value)}
        >
          <option value="">Todos</option>
          {TIPOS.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Precio */}
      <div>
        <label className={labelCls}>Precio (USD)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            className={inputCls}
            value={get('precioMin')}
            min={0}
            onChange={e => push('precioMin', e.target.value)}
          />
          <input
            type="number"
            placeholder="Máx"
            className={inputCls}
            value={get('precioMax')}
            min={0}
            onChange={e => push('precioMax', e.target.value)}
          />
        </div>
      </div>

      {/* Hectáreas */}
      <div>
        <label className={labelCls}>Hectáreas mínimas</label>
        <input
          type="number"
          placeholder="Ej: 100"
          className={inputCls}
          value={get('hectareasMin')}
          min={0}
          onChange={e => push('hectareasMin', e.target.value)}
        />
      </div>
    </div>
  )
}
