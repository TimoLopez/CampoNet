'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Building2, Phone, FileText, ImagePlus, Loader2, Check, Camera,
  Globe, Sparkles, Image as ImageIcon, BarChart2,
} from 'lucide-react'
import type { Escritorio } from '@/lib/types'

const schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
  descripcion: z.string().optional(),
  slug: z.string().optional(),
  tagline: z.string().max(100, 'Máximo 100 caracteres').optional(),
  metricas_publicas: z.boolean(),
})

type FormData = z.infer<typeof schema>

const inputCls = "h-11 rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-sm text-[#1A1A12] placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150"

type SlugStatus =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'unavailable'; motivo: string }

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
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(escritorio?.logo_url ?? null)
  const [coverUrl, setCoverUrl] = useState<string | null>(escritorio?.cover_image_url ?? null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>({ status: 'idle' })

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: escritorio?.nombre ?? '',
      telefono: escritorio?.telefono ?? '',
      descripcion: escritorio?.descripcion ?? '',
      slug: escritorio?.slug ?? '',
      tagline: escritorio?.tagline ?? '',
      metricas_publicas: escritorio?.metricas_publicas ?? false,
    },
  })

  const slugValue = watch('slug')

  // Debounced async check del slug
  useEffect(() => {
    if (!slugValue || slugValue === escritorio?.slug) {
      setSlugStatus({ status: 'idle' })
      return
    }

    setSlugStatus({ status: 'checking' })
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch('/api/escritorios/check-slug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: slugValue }),
        })
        const json = await res.json()
        if (json.disponible) setSlugStatus({ status: 'available' })
        else setSlugStatus({ status: 'unavailable', motivo: json.motivo ?? 'No disponible' })
      } catch {
        setSlugStatus({ status: 'idle' })
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [slugValue, escritorio?.slug])

  async function onSubmit(data: FormData) {
    if (data.slug && slugStatus.status === 'unavailable') {
      toast.error('El slug no está disponible. Elegí otro.')
      return
    }

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
        slug: data.slug?.trim() || null,
        tagline: data.tagline?.trim() || null,
        metricas_publicas: data.metricas_publicas,
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

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) { toast.error('Solo se aceptan imágenes JPG, PNG o WebP.'); return }
    if (file.size > 4 * 1024 * 1024) { toast.error('La portada no puede superar los 4MB.'); return }

    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/escritorios/cover', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Error al subir la portada.'); return }
      setCoverUrl(json.url)
      toast.success('Portada actualizada.')
    } finally {
      setUploadingCover(false)
    }
  }

  const displayName = escritorio?.nombre ?? userEmail.split('@')[0]

  return (
    <div className="max-w-lg space-y-5">

      {/* Logo + identity card */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-5">
          <div className="relative group shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-2xl object-cover border border-[#E2DFD6]" />
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
              {uploadingLogo ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#F7F5F0]">
            <div className="w-7 h-7 rounded-lg bg-[#C49A3C]/10 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-[#8B6914]" />
            </div>
            <h2 className="text-[13.5px] font-semibold text-[#1A1A12]">Datos del escritorio</h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-medium text-[#2A2A1E]">Correo electrónico</Label>
              <Input value={userEmail} disabled className="h-11 rounded-xl border-[#E2DFD6] bg-[#F2EFE8] text-[#8B8A7E] text-sm cursor-not-allowed" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-[12.5px] font-medium text-[#2A2A1E]">Nombre del escritorio</Label>
              <Input id="nombre" {...register('nombre')} placeholder="Ej: Escritorio Rural Pérez" className={inputCls} />
              {errors.nombre && (
                <p className="text-[11.5px] text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-[12.5px] font-medium text-[#2A2A1E] flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#C2BFB5]" />
                Teléfono
              </Label>
              <Input id="telefono" {...register('telefono')} placeholder="099 123 456" className={inputCls} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descripcion" className="text-[12.5px] font-medium text-[#2A2A1E] flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#C2BFB5]" />
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Especialistas en campos ganaderos del litoral. Más de 20 años en el rubro..."
                rows={3}
                className="rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-sm text-[#1A1A12] placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Página pública card */}
        <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[var(--shadow-card)] overflow-hidden mt-5">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#F7F5F0]">
            <div className="w-7 h-7 rounded-lg bg-[#1C3311]/10 flex items-center justify-center">
              <Globe className="h-3.5 w-3.5 text-[#2D5018]" />
            </div>
            <h2 className="text-[13.5px] font-semibold text-[#1A1A12]">Página pública</h2>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-[12.5px] font-medium text-[#2A2A1E]">URL pública</Label>
              <div className="flex items-center gap-2 rounded-xl border border-[#E2DFD6] bg-[#F9F8F5] focus-within:border-[#C49A3C] focus-within:ring-2 focus-within:ring-[#C49A3C]/20 transition-all duration-150">
                <span className="pl-3 text-[12.5px] text-[#8B8A7E]">camponet.uy/escritorios/</span>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="mi-escritorio"
                  className="h-11 border-0 bg-transparent text-sm flex-1 focus-visible:ring-0 focus-visible:border-0 pl-0"
                />
                {slugStatus.status === 'checking' && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8B8A7E] mr-3" />}
                {slugStatus.status === 'available' && <Check className="h-3.5 w-3.5 text-emerald-600 mr-3" />}
              </div>
              {slugStatus.status === 'unavailable' && (
                <p className="text-[11.5px] text-red-500">{slugStatus.motivo}</p>
              )}
              {slugStatus.status === 'available' && (
                <p className="text-[11.5px] text-emerald-600">Disponible</p>
              )}
              <p className="text-[11px] text-[#B0AD9E]">Solo letras minúsculas, números y guiones</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagline" className="text-[12.5px] font-medium text-[#2A2A1E] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#C2BFB5]" />
                Frase corta
              </Label>
              <Input
                id="tagline"
                {...register('tagline')}
                placeholder="Especialistas en campos ganaderos del litoral norte"
                className={inputCls}
              />
              {errors.tagline && <p className="text-[11.5px] text-red-500">{errors.tagline.message}</p>}
              <p className="text-[11px] text-[#B0AD9E]">Aparece bajo tu nombre en la página pública (máx. 100 chars)</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[12.5px] font-medium text-[#2A2A1E] flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-[#C2BFB5]" />
                Imagen de portada
              </Label>
              {coverUrl ? (
                <div className="relative group">
                  <img src={coverUrl} alt="Portada" className="w-full h-32 rounded-xl object-cover border border-[#E2DFD6]" />
                  <button
                    type="button"
                    disabled={uploadingCover}
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
                  >
                    {uploadingCover ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={uploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-[#E2DFD6] bg-[#F9F8F5] hover:bg-[#F2EFE8] flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {uploadingCover ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#8B8A7E]" />
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5 text-[#8B8A7E]" />
                      <span className="text-[12px] text-[#8B8A7E]">Subir portada (máx. 4 MB)</span>
                    </>
                  )}
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F9F8F5] border border-[#E2DFD6]">
              <input
                type="checkbox"
                id="metricas_publicas"
                {...register('metricas_publicas')}
                className="mt-0.5 h-4 w-4 rounded border-[#C2BFB5] text-[#1C3311] focus:ring-[#C49A3C] cursor-pointer"
              />
              <div className="flex-1">
                <Label htmlFor="metricas_publicas" className="text-[12.5px] font-medium text-[#2A2A1E] flex items-center gap-1.5 cursor-pointer">
                  <BarChart2 className="h-3.5 w-3.5 text-[#C2BFB5]" />
                  Mostrar métricas en la página pública
                </Label>
                <p className="text-[11px] text-[#8B8A7E] mt-1">Cantidad de campos publicados y hectáreas en cartera.</p>
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className={`w-full h-11 mt-5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
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
      </form>
    </div>
  )
}
