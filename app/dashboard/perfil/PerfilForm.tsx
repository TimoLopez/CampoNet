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
import { Building2, Phone, FileText, ImagePlus, Loader2, Check, Camera } from 'lucide-react'
import type { Escritorio } from '@/lib/types'

const schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const inputCls = "h-11 rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-sm text-[#1A1A12] placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150"

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
      const { error } = await supabase.from('escritorios').upsert({
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
    if (!validTypes.includes(file.type)) { toast.error('Solo se aceptan imágenes JPG, PNG o WebP.'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('El logo no puede superar los 2MB.'); return }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/escritorios/logo', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Error al subir el logo.'); return }
      setLogoUrl(json.url)
      toast.success('Logo actualizado.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const displayName = escritorio?.nombre ?? userEmail.split('@')[0]

  return (
    <div className="max-w-lg space-y-5">

      {/* Logo + identity card */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-5">
          {/* Logo with upload overlay */}
          <div className="relative group shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-16 w-16 rounded-2xl object-cover border border-[#E2DFD6]"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-[#1C3311]/8 border border-[#E2DFD6] flex items-center justify-center">
                <Building2 className="h-7 w-7 text-[#1C3311]/35" />
              </div>
            )}
            <button
              type="button"
              disabled={uploadingLogo}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
              aria-label="Cambiar logo"
            >
              {uploadingLogo
                ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                : <Camera className="h-5 w-5 text-white" />
              }
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-[#1A1A12] truncate">{displayName}</p>
            <p className="text-[12.5px] text-[#8B8A7E] mt-0.5 truncate">{userEmail}</p>
            <button
              type="button"
              disabled={uploadingLogo}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#8B6914] hover:text-[#C49A3C] transition-colors duration-150 cursor-pointer mt-2 disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              {logoUrl ? 'Cambiar logo' : 'Subir logo'}
              <span className="text-[#D8D5CC] mx-1">·</span>
              <span className="text-[#C2BFB5] font-normal">máx. 2 MB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#F7F5F0]">
          <div className="w-7 h-7 rounded-lg bg-[#C49A3C]/10 flex items-center justify-center">
            <Building2 className="h-3.5 w-3.5 text-[#8B6914]" />
          </div>
          <h2 className="text-[13.5px] font-semibold text-[#1A1A12]">Datos del escritorio</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Email read-only */}
          <div className="space-y-1.5">
            <Label className="text-[12.5px] font-medium text-[#2A2A1E]">Correo electrónico</Label>
            <Input
              value={userEmail}
              disabled
              className="h-11 rounded-xl border-[#E2DFD6] bg-[#F2EFE8] text-[#8B8A7E] text-sm cursor-not-allowed"
            />
            <p className="text-[11px] text-[#C2BFB5]">El email no se puede cambiar desde aquí</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-[12.5px] font-medium text-[#2A2A1E]">Nombre del escritorio</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Ej: Escritorio Rural Pérez"
              className={inputCls}
            />
            {errors.nombre && (
              <p className="text-[11.5px] text-red-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                {errors.nombre.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono" className="text-[12.5px] font-medium text-[#2A2A1E] flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#C2BFB5]" />
              Teléfono
            </Label>
            <Input
              id="telefono"
              {...register('telefono')}
              placeholder="099 123 456"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-[12.5px] font-medium text-[#2A2A1E] flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#C2BFB5]" />
              Descripción corta
            </Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Breve descripción de tu escritorio rural..."
              rows={3}
              className="rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-sm text-[#1A1A12] placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-11 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
              saved
                ? 'bg-emerald-600 hover:bg-emerald-600 shadow-[0_2px_8px_-2px_rgba(5,150,105,0.4)]'
                : 'bg-[#1C3311] hover:bg-[#254516] shadow-[0_2px_8px_-2px_rgba(28,51,17,0.4)] hover:shadow-[0_4px_14px_-4px_rgba(28,51,17,0.5)]'
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
        </form>
      </div>
    </div>
  )
}
