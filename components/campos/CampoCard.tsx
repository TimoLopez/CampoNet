'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Copy, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Campo } from '@/lib/types'

const estadoBadge = {
  publicado: { label: 'Publicado', className: 'bg-[#2D5018]/15 text-[#2D5018] border-[#2D5018]/20' },
  borrador: { label: 'Borrador', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  archivado: { label: 'Archivado', className: 'bg-[#8B6914]/15 text-[#8B6914] border-[#8B6914]/20' },
}

export default function CampoCard({ campo }: { campo: Campo }) {
  const [copied, setCopied] = useState(false)
  const badge = estadoBadge[campo.estado]
  const primeraFoto = campo.fotos?.[0]

  function copyUrl() {
    const url = `${window.location.origin}/campo/${campo.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2DFD6] overflow-hidden shadow-[0_1px_3px_0_rgba(28,51,17,0.06)] hover:shadow-[0_4px_12px_-2px_rgba(28,51,17,0.1)] transition-all duration-200 group">
      <div className="h-40 bg-[#F2EFE8] flex items-center justify-center overflow-hidden">
        {primeraFoto ? (
          <img
            src={primeraFoto}
            alt={campo.titulo}
            className="w-full h-full object-cover group-hover:scale-[1.03] group-hover:brightness-[1.03] transition-all duration-300"
          />
        ) : (
          <MapPin className="h-8 w-8 text-[#C2BFB5]" />
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#1A1A12] line-clamp-2 text-sm leading-tight">{campo.titulo}</h3>
          <Badge
            className={`shrink-0 text-xs border ${badge.className}${campo.estado === 'publicado' ? ' shadow-[0_0_0_3px_rgba(45,80,24,0.08)]' : ''}`}
          >
            {badge.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#5C5B4F]">
          <MapPin className="h-3.5 w-3.5" />
          <span>{campo.departamento} · {campo.hectareas} ha</span>
        </div>
        {campo.precio_usd && (
          <p className="text-base font-bold text-[#1C3311]">
            USD {campo.precio_usd.toLocaleString('es-UY')}
          </p>
        )}
        <div className="flex items-center gap-2 border-t border-[#F2EFE8] pt-3">
          <Link
            href={`/dashboard/campos/${campo.id}`}
            className="flex-1 text-center text-xs font-medium px-3 py-1.5 rounded-lg bg-[#1C3311] text-white hover:bg-[#254516] transition-colors cursor-pointer"
          >
            Editar
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2 border-[#E2DFD6] text-[#5C5B4F] cursor-pointer"
            onClick={copyUrl}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
