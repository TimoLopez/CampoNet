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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
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
        toast.success('Perfil actualizado.')
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
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Datos del escritorio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={userEmail} disabled className="bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-400">El email no se puede cambiar desde aquí</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="nombre">Nombre del escritorio</Label>
            <Input id="nombre" {...register('nombre')} />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" {...register('telefono')} placeholder="099 123 456" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="descripcion">Descripción corta</Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Breve descripción de tu escritorio"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Logo del escritorio</Label>
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-full object-cover border" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingLogo}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingLogo ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
            </Button>
            <p className="text-xs text-gray-400">JPG, PNG o WebP · máx. 2MB</p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
