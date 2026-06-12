import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Ruler } from 'lucide-react'
import { getCamposSimilares } from '@/lib/dal/campos'
import type { CampoPublicoCard } from '@/lib/dal/campos'

interface Props {
  campoId: string
  departamento: string
  tipo: string | null
  precioUsd: number | null
}

const TIPO_LABEL: Record<string, string> = {
  ganadero: 'Ganadero',
  agricola: 'Agrícola',
  forestal: 'Forestal',
  mixto: 'Mixto',
  turistica: 'Turístico',
}

const TIPO_COLOR: Record<string, string> = {
  ganadero:  'text-amber-700',
  agricola:  'text-emerald-700',
  forestal:  'text-teal-700',
  mixto:     'text-violet-700',
  turistica: 'text-pink-700',
}

function SimilarCard({ campo }: { campo: CampoPublicoCard }) {
  const foto = campo.fotos[0] ?? null
  return (
    <Link
      href={`/campo/${campo.id}`}
      className="group flex flex-col rounded-2xl border border-[#E4E0D6] bg-white overflow-hidden shadow-[0_1px_3px_rgba(28,51,17,.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(28,51,17,.28)] hover:border-[#C49A3C]/40"
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
          <div className="absolute inset-0 flex items-center justify-center bg-[#EAE7DC]">
            <MapPin className="h-8 w-8 text-[#B0AD9E]" />
          </div>
        )}
        {campo.tipo && (
          <span
            className={`absolute top-2.5 left-2.5 text-[11px] font-semibold bg-white/90 rounded-full px-2.5 py-1 shadow-sm ${TIPO_COLOR[campo.tipo] ?? 'text-[#5C5B4F]'}`}
          >
            {TIPO_LABEL[campo.tipo] ?? campo.tipo}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-[14px] leading-snug text-[#1A1A12] line-clamp-2 group-hover:text-[#2D5018] transition-colors">
          {campo.titulo}
        </h3>
        <div className="flex items-center gap-1.5 text-[12px] text-[#7A7A6E]">
          <MapPin className="h-3.5 w-3.5 text-[#8B6914] shrink-0" />
          {campo.departamento}
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F0EDE5]">
          {campo.hectareas != null && (
            <span className="inline-flex items-center gap-1 text-[12px] text-[#5C5B4F]">
              <Ruler className="h-3.5 w-3.5 text-[#8B6914]" />
              {campo.hectareas} ha
            </span>
          )}
          <span className="ml-auto font-bold text-[14px] text-[#1A1A12] tabular-nums">
            {campo.precio_usd != null
              ? `USD ${Number(campo.precio_usd).toLocaleString('es-UY')}`
              : 'Consultar'}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function CamposSimilares({ campoId, departamento, tipo, precioUsd }: Props) {
  const similares = await getCamposSimilares({ campoId, departamento, tipo, precioUsd })
  if (!similares.length) return null

  return (
    <section className="border-t border-[#E4E0D6] pt-10 pb-6">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-1 h-5 rounded-full bg-[#C49A3C] shrink-0" />
        <h2 className="text-[16px] font-semibold text-[#1A1A12] tracking-tight">
          Campos similares en {departamento}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {similares.map(campo => (
          <SimilarCard key={campo.id} campo={campo} />
        ))}
      </div>
    </section>
  )
}
