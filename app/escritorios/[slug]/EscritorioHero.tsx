import { Building2, Phone } from 'lucide-react'
import type { Escritorio } from '@/lib/types'

interface Props {
  escritorio: Escritorio
}

export default function EscritorioHero({ escritorio }: Props) {
  const hasCover = !!escritorio.cover_image_url

  return (
    <section className="relative">
      {/* Cover background */}
      <div className={`relative w-full h-[260px] sm:h-[320px] overflow-hidden ${hasCover ? '' : 'bg-[#1C3311]'}`}>
        {hasCover && (
          <>
            <img
              src={escritorio.cover_image_url!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111D0B] via-[#111D0B]/60 to-[#111D0B]/20" />
          </>
        )}
        {!hasCover && (
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        )}
      </div>

      {/* Identity card flotante */}
      <div className="max-w-3xl mx-auto px-4 -mt-20 sm:-mt-16 relative">
        <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] p-6 sm:p-7">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Logo */}
            <div className="shrink-0">
              {escritorio.logo_url ? (
                <img
                  src={escritorio.logo_url}
                  alt={escritorio.nombre}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-[#E2DFD6]"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#1C3311]/8 border border-[#E2DFD6] flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-[#1C3311]/40" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h1 className="text-[22px] sm:text-[26px] font-bold text-[#1A1A12] leading-tight tracking-tight truncate">
                {escritorio.nombre}
              </h1>
              {escritorio.tagline && (
                <p className="text-sm sm:text-[15px] text-[#5C5B4F] mt-1.5 leading-relaxed">
                  {escritorio.tagline}
                </p>
              )}
              {escritorio.telefono && (
                <div className="flex items-center gap-1.5 mt-3 text-[12.5px] text-[#8B8A7E]">
                  <Phone className="h-3.5 w-3.5" />
                  <a
                    href={`https://wa.me/598${escritorio.telefono.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#1C3311] transition-colors"
                  >
                    {escritorio.telefono}
                  </a>
                </div>
              )}
            </div>
          </div>

          {escritorio.descripcion && (
            <div className="mt-5 pt-5 border-t border-[#F2EFE8]">
              <p className="text-[14px] text-[#5C5B4F] leading-relaxed whitespace-pre-wrap">
                {escritorio.descripcion}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
