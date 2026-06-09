'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function ExportButton() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  async function handleExport() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const estado = searchParams.get('estado')
      const campo = searchParams.get('campo')
      if (estado) params.set('estado', estado)
      if (campo) params.set('campo', campo)

      const url = `/api/leads/export${params.size > 0 ? `?${params.toString()}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Error al exportar')

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = 'leads.csv'
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[#E2DFD6] bg-white text-[12.5px] font-medium text-[#5C5A52] hover:border-[#C49A3C]/50 hover:text-[#8B6914] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <Download className="h-3.5 w-3.5" />
      {loading ? 'Exportando…' : 'Exportar CSV'}
    </button>
  )
}
