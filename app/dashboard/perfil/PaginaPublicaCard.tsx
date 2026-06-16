'use client'

import { useState } from 'react'
import { Globe, Link2, Check, ExternalLink, AlertCircle } from 'lucide-react'

interface Props {
  slug: string | null
}

export default function PaginaPublicaCard({ slug }: Props) {
  const [copiado, setCopiado] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const url = slug ? `${appUrl}/escritorios/${slug}` : null

  function copiar() {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2200)
  }

  if (!slug) {
    return (
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[13.5px] font-semibold text-amber-900">Configurá tu página pública</h3>
            <p className="text-[12px] text-amber-800 mt-1 leading-relaxed">
              Elegí un slug en "Página pública" más abajo para tener tu URL profesional y compartirla con tus clientes.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#2D5018]" />
          <h3 className="text-[13.5px] font-semibold text-[#1A1A12]">Tu página pública</h3>
        </div>
        <a
          href={url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8B8A7E] hover:text-[#1A1A12] transition-colors"
          title="Abrir"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex items-center gap-2 bg-[#F7F5F0] rounded-xl px-3 py-2.5 mb-3 min-w-0">
        <Link2 className="h-3.5 w-3.5 text-[#8B8A7E] shrink-0" />
        <span className="text-[11.5px] text-[#5C5B4F] truncate flex-1 font-mono">{url}</span>
      </div>

      <button
        type="button"
        onClick={copiar}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E2DFD6] text-[12.5px] font-medium text-[#1A1A12] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
      >
        {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
        {copiado ? 'Copiado' : 'Copiar link'}
      </button>
    </div>
  )
}
