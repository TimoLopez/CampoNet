'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) {
        toast.error('Email o contraseña incorrectos.')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[0_8px_40px_-8px_rgba(28,51,17,0.12),0_2px_8px_-2px_rgba(28,51,17,0.06)] overflow-hidden">
      {/* Top accent */}
      <div className="h-[3px] bg-gradient-to-r from-[#1C3311] via-[#3D6B22] to-[#C49A3C]" />

      <div className="px-8 pt-8 pb-9">
        <div className="mb-7">
          <h2 className="text-[22px] font-semibold text-[#1A1A12] tracking-tight">Iniciar sesión</h2>
          <p className="text-sm text-[#8B8A7E] mt-1">Accedé a tu panel de gestión</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] font-medium text-[#2A2A1E]">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="tu@email.com"
              className="h-11 rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-[#1A1A12] placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150"
            />
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[13px] font-medium text-[#2A2A1E]">
                Contraseña
              </Label>
              <Link
                href="/recuperar"
                className="text-xs text-[#8B6914] hover:text-[#C49A3C] transition-colors duration-150 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                className="h-11 pr-10 rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-[#1A1A12] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C2BFB5] hover:text-[#5C5B4F] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#1C3311] hover:bg-[#254516] active:scale-[0.98] text-white font-semibold text-sm shadow-[0_2px_8px_-2px_rgba(28,51,17,0.4)] hover:shadow-[0_4px_14px_-4px_rgba(28,51,17,0.5)] transition-all duration-200 cursor-pointer mt-1"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Ingresando...</>
            ) : 'Ingresar al panel'}
          </Button>
        </form>

        {/* Divider + register link */}
        <div className="mt-7 pt-6 border-t border-[#F2EFE8]">
          <p className="text-center text-sm text-[#8B8A7E]">
            ¿No tenés cuenta?{' '}
            <Link
              href="/registro"
              className="text-[#2D5018] font-semibold hover:text-[#C49A3C] transition-colors duration-150"
            >
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
