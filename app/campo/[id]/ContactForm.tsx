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

export default function ContactForm({ campoId }: { campoId: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  })

  async function onSubmit(data: any) {
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campoId, ...data }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      toast.error('Error al enviar la consulta. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center bg-[#F0FDF4] border border-green-200 rounded-xl p-6">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-semibold text-[#1A1A12]">¡Consulta enviada!</h3>
        <p className="text-sm text-[#5C5B4F]">
          El escritorio se va a poner en contacto con vos a la brevedad.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <span className="w-6 h-0.5 bg-[#C49A3C]/60 block mb-3 rounded-full" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          {...register('nombre')}
          placeholder="Tu nombre completo"
          className="bg-[#F9F8F5] focus:border-[#C49A3C] focus:ring-[#C49A3C]/20"
        />
        {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="tu@email.com"
          className="bg-[#F9F8F5] focus:border-[#C49A3C] focus:ring-[#C49A3C]/20"
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          {...register('telefono')}
          placeholder="099 123 456"
          className="bg-[#F9F8F5] focus:border-[#C49A3C] focus:ring-[#C49A3C]/20"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="mensaje">Mensaje</Label>
        <Textarea
          id="mensaje"
          {...register('mensaje')}
          placeholder="¿Qué querés saber sobre este campo?"
          rows={3}
          className="bg-[#F9F8F5] focus:border-[#C49A3C] focus:ring-[#C49A3C]/20"
        />
      </div>
      <p className="text-xs text-[#5C5B4F]">* Se requiere al menos email o teléfono</p>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1C3311] hover:bg-[#2D5018] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        {loading ? 'Enviando...' : 'Enviar consulta'}
      </Button>
    </form>
  )
}
