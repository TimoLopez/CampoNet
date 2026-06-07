'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Building2, Phone, FileText, ImagePlus, Loader2, Check } from 'lucide-react'
import type { Escritorio } from '@/lib/types'

const schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function PerfilForm({
  escritorio,
  userEmail,
}: {
  escritorio: Escritorio | null
  userEmail: string
}) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(escritorio?.logo_url ?? null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: escritorio?.nombre ?? '',
      telefono: escritorio?.telefono ?? '',
      descripcion: escritorio?.descripcion ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setSaved(false)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('escritorios')
        .upsert({
          id: user!.id,
          nombre: data.nombre,
          telefono: data.telefono || null,
          descripcion: data.descripcion || null,
        })

      if (error) {
        toast.error('Error al guardar los cambios.')
      } else {
        setSaved(true)
        toast.success('Perfil actualizado.')
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Solo se aceptan imágenes JPG, PNG o WebP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El logo no puede superar los 2MB.')
      return
    }

    setUploadingLogo(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const ext = file.name.split('.').pop()
      const path = `logos/${user!.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('campo-fotos')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        toast.error('Error al subir el logo.')
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('campo-fotos').getPublicUrl(path)

      await supabase.from('escritorios').update({ logo_url: publicUrl }).eq('id', user!.id)
      setLogoUrl(publicUrl)
      toast.success('Logo actualizado.')
    } finally {
      setUploadingLogo(false)
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      {/* Logo section */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-[#E2DFD6] ring-offset-2"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#1C3311]/8 ring-1 ring-[#E2DFD6] flex items-center justify-center">
              <Building2 className="h-7 w-7 text-[#1C3311]/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A1A12] truncate">
              {escritorio?.nombre ?? userEmail.split('@')[0]}
            </p>
            <p className="text-xs text-[#5C5B4F] mt-0.5">{userEmail}</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B6914] hover:text-[#C49A3C] transition-colors cursor-pointer disabled:opacity-60"
              >
                {uploadingLogo
                  ? <><Loader2 className="h-3 w-3 animate-spin" />Subiendo...</>
                  : <><ImagePlus className="h-3 w-3" />{logoUrl ? 'Cambiar logo' : 'Subir logo'}</>
                }
              </button>
              <span className="text-[#E2DFD6]">·</span>
              <span className="text-xs text-[#9C9B91]">JPG, PNG o WebP · máx. 2 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-4 w-4 text-[#C49A3C]" />
          <h2 className="text-sm font-semibold text-[#1A1A12]">Datos del escritorio</h2>
        </div>
        <div className="h-px bg-[#E2DFD6] mb-5 mt-3" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email — read-only */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#3D3D2E]">Email</Label>
            <Input
              value={userEmail}
              disabled
              className="bg-[#F7F5F0] text-[#5C5B4F] border-[#E2DFD6]"
            />
            <p className="text-xs text-[#9C9B91]">El email no se puede cambiar desde aquí</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-[13px] font-medium text-[#3D3D2E]">
              Nombre del escritorio
            </Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Ej: Escritorio Rural Pérez"
              className="bg-[#FAFAF8]"
            />
            {errors.nombre && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono" className="text-[13px] font-medium text-[#3D3D2E]">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#9C9B91]" />
                Teléfono
              </span>
            </Label>
            <Input
              id="telefono"
              {...register('telefono')}
              placeholder="099 123 456"
              className="bg-[#FAFAF8]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-[13px] font-medium text-[#3D3D2E]">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#9C9B91]" />
                Descripción corta
              </span>
            </Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Breve descripción de tu escritorio rural"
              rows={3}
              className="bg-[#FAFAF8] resize-none"
            />
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold transition-all duration-200 cursor-pointer ${
                saved
                  ? 'bg-emerald-600 hover:bg-emerald-600'
                  : 'bg-[#1C3311] hover:bg-[#254516]'
              }`}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</>
              ) : saved ? (
                <><Check className="h-4 w-4 mr-2" />Guardado</>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
