'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Ruler, Tag } from 'lucide-react'
import type { CampoPublicoCard } from '@/lib/dal/campos'

const TIPO_LABEL: Record<string, string> = {
  ganadero: 'Ganadero',
  agricola: 'Agrícola',
  forestal: 'Forestal',
  mixto: 'Mixto',
}

const TIPO_ACCENT: Record<string, { dot: string; text: string; ring: string }> = {
  ganadero:  { dot: 'bg-amber-400',   text: 'text-amber-700',   ring: 'ring-amber-300/30'   },
  agricola:  { dot: 'bg-emerald-400', text: 'text-emerald-700', ring: 'ring-emerald-300/30' },
  forestal:  { dot: 'bg-teal-400',    text: 'text-teal-700',    ring: 'ring-teal-300/30'    },
  mixto:     { dot: 'bg-violet-400',  text: 'text-violet-700',  ring: 'ring-violet-300/30'  },
}

interface CampoCardProps {
  campo: CampoPublicoCard
}

export default function CampoCard({ campo }: CampoCardProps) {
  const foto = campo.fotos[0] ?? null
  const tipoAccent = campo.tipo ? (TIPO_ACCENT[campo.tipo] ?? null) : null

  return (
    <Link
      href={`/campo/${campo.id}`}
      className="cn-card group flex flex-col rounded-2xl border border-[#E4E0D6] bg-white overflow-hidden shadow-[0_1px_3px_rgba(28,51,17,.06)] hover:shadow-[0_24px_50px_-24px_rgba(28,51,17,.35)]"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-[#E2DFD6] overflow-hidden">
        {foto ? (
          <Image
            src={foto}
            alt={campo.titulo}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#EAE7DC]">
            <MapPin className="h-10 w-10 text-[#B0AD9E]" />
            <span className="text-xs text-[#A8A698]">Sin foto</span>
          </div>
        )}

        {/* Tipo badge */}
        {campo.tipo && tipoAccent && (
          <span
            className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 border border-white/60 shadow-sm ${tipoAccent.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${tipoAccent.dot}`} />
            {TIPO_LABEL[campo.tipo] ?? campo.tipo}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-[15px] leading-snug text-[#1A1A12] line-clamp-2 group-hover:text-[#2D5018] transition-colors">
          {campo.titulo}
        </h3>

        <div className="flex items-center gap-1.5 text-[12px] text-[#7A7A6E]">
          <MapPin className="h-3.5 w-3.5 text-[#8B6914] shrink-0" />
          <span>{campo.departamento}, Uruguay</span>
        </div>

        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-[#F0EDE5]">
          {campo.hectareas != null && (
            <span className="inline-flex items-center gap-1 text-[12px] text-[#5C5B4F]">
              <Ruler className="h-3.5 w-3.5 text-[#8B6914]" />
              {campo.hectareas} ha
            </span>
          )}
          <span className="ml-auto font-bold text-[15px] text-[#1A1A12] tabular-nums">
            {campo.precio_usd != null
              ? `USD ${Number(campo.precio_usd).toLocaleString('es-UY')}`
              : 'Consultar'}
          </span>
        </div>

        <p className="text-[11px] text-[#A8A698] flex items-center gap-1">
          <Tag className="h-3 w-3 shrink-0" />
          {campo.escritorio_nombre}
        </p>
      </div>
    </Link>
  )
}
