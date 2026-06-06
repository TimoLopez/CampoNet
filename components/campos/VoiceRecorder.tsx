'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export interface CampoVozFields {
  titulo?: string | null
  departamento?: string | null
  hectareas?: number | null
  tipo?: 'ganadero' | 'agricola' | 'forestal' | 'mixto' | null
  precio_usd?: number | null
  agua?: boolean | null
  acceso_ruta?: boolean | null
}

interface Props {
  onFieldsExtracted: (fields: CampoVozFields) => void
  onTranscripcionReady: (texto: string) => void
}

type Status = 'idle' | 'recording' | 'processing' | 'done'

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function VoiceRecorder({ onFieldsExtracted, onTranscripcionReady }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [seconds, setSeconds] = useState(0)
  const [texto, setTexto] = useState('')
  const [rellenando, setRellenando] = useState(false)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const streamRef = useRef<MediaStream | null>(null)
  const mimeTypeRef = useRef<string>('audio/webm')

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'
      mimeTypeRef.current = mimeType

      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })
        setStatus('processing')
        try {
          const formData = new FormData()
          const ext = mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm'
          formData.append('audio', blob, `audio.${ext}`)
          const res = await fetch('/api/ia/transcribir', { method: 'POST', body: formData })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error((err as any).error ?? 'transcription failed')
          }
          const json = await res.json()
          if (!json.texto) throw new Error('no text')
          setTexto(json.texto)
          setStatus('done')
        } catch {
          toast.error('Error al transcribir el audio.')
          setStatus('idle')
        }
      }

      recorder.start()
      setSeconds(0)
      setStatus('recording')
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch {
      toast.error('No se pudo acceder al micrófono.')
    }
  }

  function stopRecording() {
    clearInterval(timerRef.current)
    recorderRef.current?.stop()
  }

  async function handleRellenar() {
    setRellenando(true)
    try {
      const res = await fetch('/api/ia/interpretar-campo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcripcion: texto }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).error ?? 'interpretation failed')
      }
      const campos: CampoVozFields = await res.json()
      onTranscripcionReady(texto)
      onFieldsExtracted(campos)
      toast.success('Campos rellenados con la transcripción.')
      setStatus('idle')
      setTexto('')
    } catch {
      toast.error('Error al interpretar la transcripción.')
    } finally {
      setRellenando(false)
    }
  }

  function handleCancelar() {
    setStatus('idle')
    setTexto('')
  }

  if (status === 'idle') {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={startRecording}
        className="gap-2 border-[#C49A3C]/40 text-[#8B6914] hover:bg-[#C49A3C]/10 cursor-pointer"
      >
        <Mic className="h-4 w-4" />
        Dictar datos del campo
      </Button>
    )
  }

  if (status === 'recording') {
    return (
      <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center gap-2 shrink-0">
          <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-700">Grabando... {formatTime(seconds)}</span>
        </div>
        <p className="text-xs text-red-500 flex-1 hidden sm:block">
          Hablá sobre el campo: ubicación, hectáreas, tipo, precio, características...
        </p>
        <Button
          type="button"
          size="sm"
          onClick={stopRecording}
          className="bg-red-600 hover:bg-red-700 text-white cursor-pointer shrink-0"
        >
          Detener
        </Button>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="flex items-center gap-3 p-4 bg-[#F7F5F0] rounded-xl border border-[#E2DFD6]">
        <Loader2 className="h-4 w-4 animate-spin text-[#8B6914]" />
        <span className="text-sm text-[#5C5B4F]">Transcribiendo...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4 bg-[#F7F5F0] rounded-xl border border-[#E2DFD6]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#1A1A12]">Transcripción — revisá y confirmá</p>
        <button
          type="button"
          onClick={handleCancelar}
          className="text-[#5C5B4F] hover:text-[#1A1A12] cursor-pointer"
          aria-label="Cancelar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Textarea
        value={texto}
        onChange={e => setTexto(e.target.value)}
        rows={4}
        className="resize-none text-sm"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={rellenando || !texto.trim()}
          onClick={handleRellenar}
          className="bg-[#1C3311] hover:bg-[#254516] cursor-pointer"
        >
          {rellenando
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Interpretando...</>
            : 'Rellenar campos'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCancelar}
          className="cursor-pointer"
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
