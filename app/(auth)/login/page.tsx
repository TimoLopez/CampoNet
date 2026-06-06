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
import { Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
    <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[0_8px_32px_-4px_rgba(28,51,17,0.08),0_2px_8px_-2px_rgba(28,51,17,0.05)] overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#1C3311] via-[#2D5018] to-[#C49A3C]" />

      <div className="px-8 pt-7 pb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#1A1A12] tracking-tight">Iniciar sesión</h2>
          <p className="text-sm text-[#5C5B4F] mt-1">Accedé a tu panel de gestión</p>
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-[#1A1A12]">Contraseña</Label>
              <Link
                href="/recuperar"
                className="text-xs text-[#8B6914] hover:text-[#C49A3C] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className="h-10 border-[#E2DFD6] bg-[#F9F8F5] focus:border-[#C49A3C] focus:ring-[#C49A3C]/20 transition-colors"
            />
            {errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-[#1C3311] hover:bg-[#2D5018] text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer mt-2"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Ingresando...</>
            ) : 'Ingresar'}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#F2EFE8]">
          <p className="text-center text-sm text-[#5C5B4F]">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="text-[#2D5018] font-medium hover:text-[#C49A3C] transition-colors">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
