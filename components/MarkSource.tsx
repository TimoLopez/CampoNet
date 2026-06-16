'use client'

import { useEffect } from 'react'

type LeadOrigin = 'pagina_publica' | 'buscador'

interface Props {
  source: LeadOrigin
}

// Marca el origen del lead en sessionStorage para que sobreviva a la navegación
// client-side de Next.js (donde document.referrer no se actualiza).
export default function MarkSource({ source }: Props) {
  useEffect(() => {
    try {
      sessionStorage.setItem('camponet_lead_origin', source)
    } catch {
      // sessionStorage puede no estar disponible (modo privado, etc.)
    }
  }, [source])

  return null
}
