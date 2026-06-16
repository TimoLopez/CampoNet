'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, Send } from 'lucide-react'

const schema = z
  .object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefono: z.string().optional(),
    mensaje: z.string().optional(),
  })
  .refine(data => data.email || data.telefono, {
    message: 'Ingresá al menos un email o teléfono',
    path: ['email'],
  })

type FormData = z.infer<typeof schema>

const inputCls = "h-11 rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-sm placeholder:text-[#C2BFB5] text-[#1A1A12] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150"

export default function ContactForm({ campoId }: { campoId: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })

  async function onSubmit(data: any) {
    setLoading(true)
    try {
      let origenHint: string | null = null
      try {
        const stored = sessionStorage.getItem('camponet_lead_origin')
        if (stored === 'pagina_publica' || stored === 'buscador') origenHint = stored
      } catch {
        // sessionStorage no disponible
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campoId, ...data, origenHint }),
      })
      if (!res.ok) throw new Error()

      try {
        sessionStorage.removeItem('camponet_lead_origin')
      } catch {
        // ignore
      }

      setSubmitted(true)
    } catch {
      toast.error('Error al enviar la consulta. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-8 px-4 animate-scale-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-[15px] font-semibold text-[#1A1A12] mb-2">¡Consulta enviada!</h3>
        <p className="text-[13px] text-[#8B8A7E] leading-relaxed">
          El escritorio se va a poner en contacto con vos a la brevedad.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cf-nombre" className="text-[12.5px] font-medium text-[#2A2A1E]">Nombre completo *</Label>
        <Input
          id="cf-nombre"
          {...register('nombre')}
          placeholder="Tu nombre"
          className={inputCls}
        />
        {errors.nombre && <p className="text-[11.5px] text-red-500 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />{errors.nombre.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cf-email" className="text-[12.5px] font-medium text-[#2A2A1E]">Email</Label>
        <Input
          id="cf-email"
          type="email"
          {...register('email')}
          placeholder="tu@email.com"
          className={inputCls}
        />
        {errors.email && <p className="text-[11.5px] text-red-500 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cf-telefono" className="text-[12.5px] font-medium text-[#2A2A1E]">Teléfono</Label>
        <Input
          id="cf-telefono"
          {...register('telefono')}
          placeholder="099 123 456"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cf-mensaje" className="text-[12.5px] font-medium text-[#2A2A1E]">Mensaje</Label>
        <Textarea
          id="cf-mensaje"
          {...register('mensaje')}
          placeholder="¿Qué querés saber sobre este campo?"
          rows={3}
          className="rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-sm placeholder:text-[#C2BFB5] text-[#1A1A12] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150 resize-none"
        />
      </div>

      <p className="text-[11px] text-[#8B8A7E]">* Se requiere al menos email o teléfono de contacto</p>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl bg-[#1C3311] hover:bg-[#254516] active:scale-[0.98] text-white font-semibold text-sm shadow-[0_2px_8px_-2px_rgba(28,51,17,0.4)] hover:shadow-[0_4px_14px_-4px_rgba(28,51,17,0.5)] transition-all duration-200 cursor-pointer"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</>
          : <><Send className="h-4 w-4 mr-2" />Enviar consulta</>
        }
      </Button>
    </form>
  )
}
