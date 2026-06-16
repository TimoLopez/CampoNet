'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, Filter as FilterIcon, X } from 'lucide-react'
import type { CampoPublicoCard } from '@/lib/dal/campos'

const TIPO_LABEL: Record<string, string> = {
  ganadero: 'Ganadero',
  agricola: 'Agrícola',
  forestal: 'Forestal',
  mixto: 'Mixto',
  turistica: 'Turístico',
}

interface Props {
  campos: CampoPublicoCard[]
}

export default function CamposPublicosGrid({ campos }: Props) {
  const [tipo, setTipo] = useState<string>('')
  const [departamento, setDepartamento] = useState<string>('')

  const departamentos = useMemo(() => {
    return Array.from(new Set(campos.map(c => c.departamento))).sort()
  }, [campos])

  const tipos = useMemo(() => {
    return Array.from(new Set(campos.map(c => c.tipo).filter((t): t is string => !!t))).sort()
  }, [campos])

  const filtrados = useMemo(() => {
    return campos.filter(c => {
      if (tipo && c.tipo !== tipo) return false
      if (departamento && c.departamento !== departamento) return false
      return true
    })
  }, [campos, tipo, departamento])

  const filtroActivo = !!(tipo || departamento)

  if (campos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-[#E2DFD6] p-10 text-center">
        <p className="text-[13.5px] text-[#8B8A7E]">Este escritorio aún no tiene campos publicados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-bold text-[#1A1A12]">Cartera de campos</h2>
        <span className="text-[12px] text-[#8B8A7E] tabular-nums">{filtrados.length} resultados</span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="h-9 rounded-xl border border-[#E2DFD6] bg-white px-3 text-[12.5px] text-[#1A1A12] cursor-pointer"
        >
          <option value="">Todos los tipos</option>
          {tipos.map(t => <option key={t} value={t}>{TIPO_LABEL[t] ?? t}</option>)}
        </select>
        <select
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          className="h-9 rounded-xl border border-[#E2DFD6] bg-white px-3 text-[12.5px] text-[#1A1A12] cursor-pointer"
        >
          <option value="">Todos los deptos</option>
          {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {filtroActivo && (
          <button
            type="button"
            onClick={() => { setTipo(''); setDepartamento('') }}
            className="inline-flex items-center gap-1 text-[12px] text-[#8B8A7E] hover:text-[#1A1A12] transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#E2DFD6] p-10 text-center">
          <FilterIcon className="h-5 w-5 text-[#C2BFB5] mx-auto mb-2" />
          <p className="text-[13px] text-[#8B8A7E]">No hay campos con esos filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtrados.map(campo => (
            <Link
              key={campo.id}
              href={`/campo/${campo.id}`}
              className="group bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] transition-shadow duration-200"
            >
              {campo.fotos[0] ? (
                <div className="aspect-video bg-[#F2EFE8] overflow-hidden">
                  <img
                    src={campo.fotos[0]}
                    alt={campo.titulo}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-[#1C3311]/8 flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-[#1C3311]/30" />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-[14px] font-semibold text-[#1A1A12] truncate group-hover:text-[#2D5018] transition-colors">
                  {campo.titulo}
                </h3>
                <p className="text-[12px] text-[#8B8A7E] mt-1">
                  {campo.departamento}
                  {campo.tipo ? ` · ${TIPO_LABEL[campo.tipo] ?? campo.tipo}` : ''}
                  {campo.hectareas ? ` · ${campo.hectareas} há` : ''}
                </p>
                {campo.precio_usd && (
                  <p className="text-[14px] font-bold text-[#1C3311] mt-2 tabular-nums">
                    USD {campo.precio_usd.toLocaleString('es-UY')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
