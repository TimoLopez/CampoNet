'use client'

import { useState } from 'react'
import { Link2, Check, MessageCircle, ExternalLink } from 'lucide-react'

interface Props {
  token: string
  titulo: string
}

export default function CompartirConDueno({ token, titulo }: Props) {
  const [copiado, setCopiado] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const url = `${appUrl}/propietario/${token}`

  function copiar() {
    navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2200)
  }

  function whatsapp() {
    const texto = encodeURIComponent(
      `Hola, te comparto el portal de actividad de tu campo "${titulo}" en CampoNet. Podés ver visitas, consultas e interesados en tiempo real: ${url}`
    )
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="text-[13.5px] font-semibold text-[#1A1A12]">Portal del propietario</h2>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8B8A7E] hover:text-[#1A1A12] transition-colors"
          title="Ver portal"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <p className="text-[12px] text-[#8B8A7E] mb-4 leading-relaxed">
        Compartí este link con el dueño del campo para que vea la actividad en tiempo real, sin necesidad de registrarse.
      </p>

      <div className="flex items-center gap-2 bg-[#F7F5F0] rounded-xl px-3 py-2.5 mb-3 min-w-0">
        <Link2 className="h-3.5 w-3.5 text-[#8B8A7E] shrink-0" />
        <span className="text-[11px] text-[#5C5B4F] truncate flex-1 font-mono">{url}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copiar}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E2DFD6] text-[12.5px] font-medium text-[#1A1A12] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
        >
          {copiado ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          {copiado ? 'Copiado' : 'Copiar link'}
        </button>
        <button
          type="button"
          onClick={whatsapp}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#25D366] text-white text-[12.5px] font-semibold hover:bg-[#1fb855] transition-colors cursor-pointer"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </button>
      </div>
    </div>
  )
}
