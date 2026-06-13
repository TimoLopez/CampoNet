'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2 } from 'lucide-react'

export default function GenerarReporteButton({ campoId }: { campoId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleClick() {
    setLoading(true)
    router.push(`/dashboard/campos/${campoId}/reporte`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C3311] text-white text-sm font-semibold hover:bg-[#254516] active:scale-[0.97] transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-default shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {loading ? 'Generando…' : 'Generar reporte para el propietario'}
    </button>
  )
}
