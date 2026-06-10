'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Copy, Check, ExternalLink, Pencil, BarChart2 } from 'lucide-react'
import type { Campo } from '@/lib/types'

const estadoConfig = {
  publicado: {
    label: 'Publicado',
    dot: 'bg-emerald-500',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  },
  borrador: {
    label: 'Borrador',
    dot: 'bg-zinc-400',
    className: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
  archivado: {
    label: 'Archivado',
    dot: 'bg-amber-400',
    className: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  vendido: {
    label: 'Vendido',
    dot: 'bg-emerald-600',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-300/80',
  },
}

export default function CampoCard({ campo }: { campo: Campo }) {
  const [copied, setCopied] = useState(false)
  const config = estadoConfig[campo.estado] ?? estadoConfig.borrador
  const primeraFoto = campo.fotos?.[0]

  function copyUrl() {
    const url = `${window.location.origin}/campo/${campo.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[#C49A3C]/25 transition-all duration-250">

      {/* Image */}
      <div className="relative h-44 bg-[#F2EFE8] overflow-hidden">
        {primeraFoto ? (
          <img
            src={primeraFoto}
            alt={campo.titulo}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <MapPin className="h-8 w-8 text-[#D8D5CC]" />
            <span className="text-xs text-[#C2BFB5]">Sin foto</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Status badge — top right */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${config.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} aria-hidden />
            {config.label}
          </span>
        </div>

        {/* View public link — appears on hover */}
        {campo.estado === 'publicado' && (
          <a
            href={`/campo/${campo.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-[11px] font-medium text-[#1A1A12] hover:bg-white shadow-sm cursor-pointer border border-white/80"
          >
            <ExternalLink className="h-3 w-3" />
            Ver ficha
          </a>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-[#1A1A12] line-clamp-2 text-[13.5px] leading-snug group-hover:text-[#1C3311] transition-colors duration-150">
            {campo.titulo}
          </h3>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#8B8A7E] mt-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{campo.departamento}</span>
            <span className="text-[#D8D5CC]">·</span>
            <span>{campo.hectareas} ha</span>
          </div>
        </div>

        {campo.precio_usd && (
          <p className="text-[15px] font-bold text-[#1C3311]">
            USD <span className="tabular-nums">{campo.precio_usd.toLocaleString('es-UY')}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#F7F5F0]">
          <Link
            href={`/dashboard/campos/${campo.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-[12.5px] font-semibold px-3 py-2 rounded-xl bg-[#1C3311] text-white hover:bg-[#254516] active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-sm"
          >
            <Pencil className="h-3 w-3" />
            Editar
          </Link>
          <Link
            href={`/dashboard/campos/${campo.id}/estadisticas`}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2DFD6] text-[#8B8A7E] hover:border-[#C49A3C]/40 hover:text-[#8B6914] hover:bg-[#F9F8F5] active:scale-[0.95] transition-all duration-150 cursor-pointer"
            title="Ver estadísticas"
          >
            <BarChart2 className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={copyUrl}
            title={copied ? 'Copiado' : 'Copiar enlace público'}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2DFD6] text-[#8B8A7E] hover:border-[#C49A3C]/40 hover:text-[#8B6914] hover:bg-[#F9F8F5] active:scale-[0.95] transition-all duration-150 cursor-pointer"
          >
            {copied
              ? <Check className="h-3.5 w-3.5 text-emerald-600" />
              : <Copy className="h-3.5 w-3.5" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
