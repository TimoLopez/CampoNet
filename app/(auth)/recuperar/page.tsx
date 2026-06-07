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
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

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
      if (error) { toast.error('Error al enviar el email. Intentá de nuevo.'); return }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[0_8px_40px_-8px_rgba(28,51,17,0.12)] overflow-hidden animate-scale-in">
        <div className="h-[3px] bg-[#2D5018]" />
        <div className="px-8 pt-10 pb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/60 mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-[22px] font-semibold text-[#1A1A12] tracking-tight mb-2">Revisá tu email</h2>
          <p className="text-sm text-[#8B8A7E] leading-relaxed mb-8 max-w-xs mx-auto">
            Si el email está registrado, te enviamos un link para restablecer tu contraseña. Revisá también la carpeta de spam.
          </p>
          <Link href="/login">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl border-[#E2DFD6] text-[#1A1A12] hover:bg-[#F2EFE8] hover:border-[#C49A3C]/40 transition-all duration-200 cursor-pointer font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[0_8px_40px_-8px_rgba(28,51,17,0.12),0_2px_8px_-2px_rgba(28,51,17,0.06)] overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-[#1C3311] via-[#3D6B22] to-[#C49A3C]" />
      <div className="px-8 pt-8 pb-9">
        <div className="mb-7">
          <h2 className="text-[22px] font-semibold text-[#1A1A12] tracking-tight">Recuperar contraseña</h2>
          <p className="text-sm text-[#8B8A7E] mt-1 leading-relaxed">
            Ingresá tu email y te enviamos un link para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] font-medium text-[#2A2A1E]">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="tu@email.com"
              className="h-11 rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-[#1A1A12] placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150"
            />
            {errors.email && <p className="text-xs text-red-500 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />{errors.email.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#1C3311] hover:bg-[#254516] active:scale-[0.98] text-white font-semibold text-sm shadow-[0_2px_8px_-2px_rgba(28,51,17,0.4)] hover:shadow-[0_4px_14px_-4px_rgba(28,51,17,0.5)] transition-all duration-200 cursor-pointer"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enviando...</> : 'Enviar link de recuperación'}
          </Button>
        </form>

        <div className="mt-7 pt-6 border-t border-[#F2EFE8]">
          <p className="text-center text-sm text-[#8B8A7E]">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-[#2D5018] font-semibold hover:text-[#C49A3C] transition-colors duration-150">
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
