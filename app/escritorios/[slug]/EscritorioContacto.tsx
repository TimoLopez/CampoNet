import { Phone, MessageCircle } from 'lucide-react'
import type { Escritorio } from '@/lib/types'

interface Props {
  escritorio: Escritorio
}

export default function EscritorioContacto({ escritorio }: Props) {
  if (!escritorio.telefono) return null

  const telefonoNumeros = escritorio.telefono.replace(/\D/g, '')

  return (
    <div className="bg-[#1C3311] rounded-2xl p-6 text-white">
      <h2 className="text-[16px] font-bold mb-1">¿Te interesa un campo?</h2>
      <p className="text-[13px] text-white/70 mb-4">Contactanos directamente.</p>

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://wa.me/598${telefonoNumeros}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-[12.5px] font-semibold hover:bg-[#1fb855] transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
        <a
          href={`tel:${telefonoNumeros}`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 text-white text-[12.5px] font-semibold hover:bg-white/15 transition-colors"
        >
          <Phone className="h-3.5 w-3.5" />
          Llamar
        </a>
      </div>
    </div>
  )
}
