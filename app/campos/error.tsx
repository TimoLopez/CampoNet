'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[/campos] page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F4F2EB] flex items-center justify-center px-5">
      <div className="text-center">
        <p className="text-[15px] font-medium text-[#1A1A12] mb-2">No se pudieron cargar los campos</p>
        <p className="text-[13.5px] text-[#8B8A7E] mb-6">Hubo un problema al conectar con el servidor.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="h-9 px-4 rounded-xl bg-[#1C3311] text-white text-[13px] font-medium hover:bg-[#2D5018] transition-colors cursor-pointer"
          >
            Reintentar
          </button>
          <Link href="/" className="h-9 px-4 rounded-xl border border-[#E2DFD6] bg-white text-[#1A1A12] text-[13px] font-medium hover:bg-[#F7F5F0] transition-colors inline-flex items-center">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
