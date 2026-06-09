'use client'

import { Download } from 'lucide-react'

interface Props {
  estado?: string
  campo?: string
}

export default function ExportButton({ estado, campo }: Props) {
  function handleExport() {
    const params = new URLSearchParams()
    if (estado) params.set('estado', estado)
    if (campo) params.set('campo', campo)
    const url = `/api/leads/export${params.size > 0 ? `?${params.toString()}` : ''}`
    window.location.href = url
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[#E2DFD6] bg-white text-[12.5px] font-medium text-[#5C5A52] hover:border-[#C49A3C]/50 hover:text-[#8B6914] transition-colors duration-150 cursor-pointer"
    >
      <Download className="h-3.5 w-3.5" />
      Exportar CSV
    </button>
  )
}
