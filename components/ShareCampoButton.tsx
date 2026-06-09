'use client'

import { useState, useEffect, useRef } from 'react'
import { Share2, Copy, Check } from 'lucide-react'

interface Props {
  campoId: string
  titulo: string
  variant?: 'public' | 'dashboard'
}

export default function ShareCampoButton({ campoId, titulo, variant = 'public' }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const getUrl = () => {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== 'undefined' ? window.location.origin : '')
    return `${base}/campo/${campoId}`
  }

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  async function handleCopy() {
    const url = getUrl()
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        // Fallback for HTTP contexts
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
    } catch {
      // Silent fail — clipboard not available
    }
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setOpen(false)
    }, 2000)
  }

  function handleWhatsApp() {
    const url = getUrl()
    const text = encodeURIComponent(`Mirá este campo en CampoNet: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setOpen(false)
  }

  const buttonClass =
    variant === 'dashboard'
      ? 'inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12.5px] font-medium border border-[#E2DFD6] bg-white text-[#2A2A1E] hover:bg-[#F7F5F0] transition-all duration-150 cursor-pointer'
      : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] bg-white/70 border border-[#E4E0D6] text-[#5C5B4F] hover:bg-white transition-all duration-150 cursor-pointer'

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={buttonClass}
        aria-haspopup="true"
        aria-expanded={open}
        type="button"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Compartir</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-[#E2DFD6] rounded-xl shadow-[0_8px_24px_-8px_rgba(28,51,17,.18)] p-1 w-48">
          {/* Copiar link */}
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-[#2A2A1E] hover:bg-[#F7F5F0] cursor-pointer transition-colors min-h-[44px]"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[#2D5018] shrink-0" />
            ) : (
              <Copy className="h-4 w-4 shrink-0" />
            )}
            <span>{copied ? 'Copiado' : 'Copiar link'}</span>
          </button>

          {/* Compartir por WhatsApp */}
          <button
            onClick={handleWhatsApp}
            type="button"
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-[#2A2A1E] hover:bg-[#F7F5F0] cursor-pointer transition-colors min-h-[44px]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-[#25D366] shrink-0"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.428a.5.5 0 00.609.61l5.652-1.48A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.896 9.896 0 01-5.031-1.372l-.36-.214-3.733.978.997-3.645-.235-.374A9.862 9.862 0 012.1 12c0-5.463 4.437-9.9 9.9-9.9 5.463 0 9.9 4.437 9.9 9.9 0 5.463-4.437 9.9-9.9 9.9z" />
            </svg>
            <span>Enviar por WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  )
}
