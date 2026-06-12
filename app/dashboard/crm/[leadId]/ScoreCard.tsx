'use client'

import { useState } from 'react'
import { Loader2, RefreshCw, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const CATEGORIA_CONFIG: Record<string, { label: string; className: string; bar: string }> = {
  frio:     { label: 'Frío',     className: 'bg-sky-50 text-sky-700 border-sky-200/80',       bar: 'bg-sky-400' },
  tibio:    { label: 'Tibio',    className: 'bg-amber-50 text-amber-700 border-amber-200/80', bar: 'bg-amber-400' },
  caliente: { label: 'Caliente', className: 'bg-red-50 text-red-600 border-red-200/80',       bar: 'bg-red-400' },
}

interface Props {
  leadId: string
  score: number | null
  scoreCategoria: 'frio' | 'tibio' | 'caliente' | null
  scoreJustificacion: string | null
  scoreUpdatedAt: string | null
}

export default function ScoreCard({ leadId, score, scoreCategoria, scoreJustificacion, scoreUpdatedAt }: Props) {
  const [data, setData] = useState({ score, scoreCategoria, scoreJustificacion, scoreUpdatedAt })
  const [loading, setLoading] = useState(false)

  async function handleRecalcular() {
    setLoading(true)
    try {
      const res = await fetch('/api/ia/score-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData({
        score: json.score,
        scoreCategoria: json.categoria,
        scoreJustificacion: json.justificacion,
        scoreUpdatedAt: new Date().toISOString(),
      })
      toast.success('Score actualizado.')
    } catch {
      toast.error('Error al recalcular el score.')
    } finally {
      setLoading(false)
    }
  }

  const cat = data.scoreCategoria ? CATEGORIA_CONFIG[data.scoreCategoria] : null

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[13.5px] font-semibold text-[#1A1A12] flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#C49A3C] inline-block" />
          Score IA
        </h2>
        <button
          type="button"
          onClick={handleRecalcular}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-[12px] text-[#8B8A7E] hover:text-[#1A1A12] hover:bg-[#F2EFE8] px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCw className="h-3.5 w-3.5" />}
          Recalcular
        </button>
      </div>

      {data.score === null ? (
        <div className="flex items-center gap-3 py-2">
          <Brain className="h-5 w-5 text-[#C2BFB5] shrink-0" />
          <p className="text-[13px] text-[#8B8A7E]">
            Aún no calculado. Presioná Recalcular para analizar este lead con IA.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[32px] font-bold text-[#1A1A12] tabular-nums leading-none">
              {data.score}
            </span>
            {cat && (
              <span className={cn('text-[11.5px] font-semibold border px-2.5 py-1 rounded-full', cat.className)}>
                {cat.label}
              </span>
            )}
          </div>
          <div className="h-2 bg-[#F2EFE8] rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', cat?.bar ?? 'bg-[#C49A3C]')}
              style={{ width: `${data.score}%` }}
            />
          </div>
          {data.scoreJustificacion && (
            <p className="text-[13px] text-[#5C5B4F] leading-relaxed italic">
              "{data.scoreJustificacion}"
            </p>
          )}
          {data.scoreUpdatedAt && (
            <p className="text-[11px] text-[#B0AD9E]">
              Calculado el{' '}
              {new Date(data.scoreUpdatedAt).toLocaleDateString('es-UY', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
