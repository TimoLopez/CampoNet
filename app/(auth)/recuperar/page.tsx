'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

export default function RecuperarPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/perfil`,
      })

      if (error) {
        toast.error('Error al enviar el email. Intentá de nuevo.')
        return
      }

      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[0_8px_32px_-4px_rgba(28,51,17,0.08),0_2px_8px_-2px_rgba(28,51,17,0.05)] overflow-hidden">
        {/* Solid green top bar for success state */}
        <div className="h-1 bg-[#2D5018]" />

        <div className="px-8 pt-7 pb-8 text-center">
          {/* Green checkmark circle */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2D5018]/10 mb-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="#2D5018" strokeWidth="1.5" />
              <path d="M8 12.5l3 3 5-5" stroke="#2D5018" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-[#1A1A12] tracking-tight mb-2">Email enviado</h2>
          <p className="text-sm text-[#5C5B4F] leading-relaxed mb-7">
            Si el email está registrado, te enviamos el link para restablecer tu contraseña. Revisá también la carpeta de spam.
          </p>

          <Link href="/login">
            <Button
              variant="outline"
              className="w-full h-10 border-[#E2DFD6] text-[#1A1A12] hover:bg-[#F2EFE8] hover:border-[#C49A3C] transition-all duration-200"
            >
              Volver al login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[0_8px_32px_-4px_rgba(28,51,17,0.08),0_2px_8px_-2px_rgba(28,51,17,0.05)] overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#1C3311] via-[#2D5018] to-[#C49A3C]" />

      <div className="px-8 pt-7 pb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#1A1A12] tracking-tight">Recuperar contraseña</h2>
          <p className="text-sm text-[#5C5B4F] mt-1">Te enviamos un link a tu email para restablecer tu contraseña</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-[#1A1A12]">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="tu@email.com"
              className="h-10 border-[#E2DFD6] bg-[#F9F8F5] focus:border-[#C49A3C] focus:ring-[#C49A3C]/20 transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-[#1C3311] hover:bg-[#2D5018] text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</>
            ) : 'Enviar link'}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#F2EFE8]">
          <p className="text-center text-sm text-[#5C5B4F]">
            <Link href="/login" className="text-[#2D5018] font-medium hover:text-[#C49A3C] transition-colors">
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
