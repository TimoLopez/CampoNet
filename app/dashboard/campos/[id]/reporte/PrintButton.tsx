'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C3311] text-white text-sm font-semibold hover:bg-[#254516] active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-[var(--shadow-md)]"
    >
      <Printer className="h-4 w-4" />
      Imprimir / Guardar PDF
    </button>
  )
}
