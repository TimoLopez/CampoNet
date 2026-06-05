'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import GaleriaFotos from './GaleriaFotos'
import type { Campo } from '@/lib/types'

const MapboxPicker = dynamic(() => import('./MapboxPicker'), { ssr: false })

const DEPARTAMENTOS = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
  'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
  'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto',
  'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres',
]

const schema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  departamento: z.string().min(1, 'Seleccioná un departamento'),
  hectareas: z.coerce.number().positive('Debe ser mayor a 0'),
  tipo: z.enum(['ganadero', 'agricola', 'forestal', 'mixto']).optional(),
  precio_usd: z.coerce.number().positive().optional().or(z.literal(undefined)),
  descripcion: z.string().optional(),
  agua: z.boolean(),
  acceso_ruta: z.boolean(),
  video_url: z.string().url('URL de video inválida').optional().or(z.literal('')).transform(v => v || undefined),
  estado: z.enum(['publicado', 'borrador']),
  lat: z.number().optional(),
  lng: z.number().optional(),
  fotos: z.array(z.string()),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData?: Campo
}

export default function CampoForm({ initialData }: Props) {
  const router = useRouter()
  const [campoId] = useState(() => initialData?.id ?? crypto.randomUUID())
  const [generatingAI, setGeneratingAI] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      titulo: initialData?.titulo ?? '',
      departamento: initialData?.departamento ?? '',
      hectareas: initialData?.hectareas ?? ('' as any),
      tipo: initialData?.tipo ?? undefined,
      precio_usd: initialData?.precio_usd ?? ('' as any),
      descripcion: initialData?.descripcion ?? '',
      agua: initialData?.agua ?? false,
      acceso_ruta: initialData?.acceso_ruta ?? false,
      video_url: initialData?.video_url ?? '',
      estado: (initialData?.estado === 'archivado' ? 'publicado' : initialData?.estado) ?? 'borrador',
      lat: initialData?.lat ?? undefined,
      lng: initialData?.lng ?? undefined,
      fotos: initialData?.fotos ?? [],
    },
  })

  const fotos = watch('fotos')

  async function generateDescription() {
    const { titulo, hectareas, departamento, tipo, precio_usd, agua, acceso_ruta } = getValues()
    if (!titulo || !departamento || !hectareas) {
      toast.error('Completá título, departamento y hectáreas primero.')
      return
    }
    setGeneratingAI(true)
    try {
      const res = await fetch('/api/ia/generar-descripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, hectareas, departamento, tipo, precio_usd, agua, acceso_ruta }),
      })
      const json = await res.json()
      if (json.descripcion) {
        setValue('descripcion', json.descripcion)
        toast.success('Descripción generada por IA.')
      } else {
        toast.error('No se pudo generar la descripción.')
      }
    } finally {
      setGeneratingAI(false)
    }
  }

  async function save(data: FormData, publicar: boolean) {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        titulo: data.titulo,
        departamento: data.departamento,
        hectareas: data.hectareas,
        tipo: data.tipo ?? null,
        precio_usd: data.precio_usd ?? null,
        descripcion: data.descripcion || null,
        agua: data.agua,
        acceso_ruta: data.acceso_ruta,
        video_url: data.video_url || null,
        estado: publicar ? 'publicado' : data.estado,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        fotos: data.fotos,
        escritorio_id: user!.id,
      }

      let error: any
      if (initialData) {
        ;({ error } = await supabase.from('campos').update(payload).eq('id', campoId))
      } else {
        ;({ error } = await supabase.from('campos').insert({ id: campoId, ...payload }))
      }

      if (error) {
        toast.error('Error al guardar el campo.')
        return
      }

      toast.success(publicar ? 'Campo publicado.' : 'Borrador guardado.')
      router.push('/dashboard/campos')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6 max-w-2xl">
      {/* Datos básicos */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 space-y-4">
        <h2 className="font-semibold text-[#1A1A12]">Datos básicos</h2>
        <Separator className="bg-[#E2DFD6]" />

        <div className="space-y-1">
          <Label htmlFor="titulo">Título del campo *</Label>
          <Input id="titulo" {...register('titulo')} placeholder="Ej: Campo ganadero en Tacuarembó" />
          {errors.titulo && <p className="text-sm text-red-500">{errors.titulo.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Departamento *</Label>
            <Controller
              name="departamento"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccioná..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTAMENTOS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.departamento && <p className="text-sm text-red-500">{errors.departamento.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="hectareas">Hectáreas *</Label>
            <Input id="hectareas" type="number" step="0.1" min="0" {...register('hectareas')} placeholder="Ej: 250" />
            {errors.hectareas && <p className="text-sm text-red-500">{errors.hectareas.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Tipo de campo</Label>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={v => field.onChange(v || undefined)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccioná..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ganadero">Ganadero</SelectItem>
                    <SelectItem value="agricola">Agrícola</SelectItem>
                    <SelectItem value="forestal">Forestal</SelectItem>
                    <SelectItem value="mixto">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="precio_usd">Precio (USD)</Label>
            <Input id="precio_usd" type="number" min="0" {...register('precio_usd')} placeholder="Opcional" />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Controller
              name="agua"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} id="agua" />
              )}
            />
            <Label htmlFor="agua" className="cursor-pointer">Fuente de agua</Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              name="acceso_ruta"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} id="acceso_ruta" />
              )}
            />
            <Label htmlFor="acceso_ruta" className="cursor-pointer">Acceso por ruta</Label>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#1A1A12]">Descripción</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={generatingAI}
            onClick={generateDescription}
            className="gap-1.5 border-[#C49A3C]/40 text-[#8B6914] hover:bg-[#C49A3C]/10 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generatingAI ? 'Generando...' : 'Generar con IA'}
          </Button>
        </div>
        <Separator className="bg-[#E2DFD6]" />
        <Textarea
          {...register('descripcion')}
          placeholder="Describí las características del campo..."
          rows={5}
        />
      </div>

      {/* Fotos y video */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 space-y-4">
        <h2 className="font-semibold text-[#1A1A12]">Fotos y video</h2>
        <Separator className="bg-[#E2DFD6]" />
        <Controller
          name="fotos"
          control={control}
          render={({ field }) => (
            <GaleriaFotos campoId={campoId} fotos={field.value} onChange={field.onChange} />
          )}
        />
        <div className="space-y-1">
          <Label htmlFor="video_url">URL de video (YouTube o Vimeo)</Label>
          <Input id="video_url" {...register('video_url')} placeholder="https://youtube.com/watch?v=..." />
          {errors.video_url && <p className="text-sm text-red-500">{errors.video_url.message}</p>}
        </div>
      </div>

      {/* Ubicación */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 space-y-4">
        <h2 className="font-semibold text-[#1A1A12]">Ubicación en el mapa</h2>
        <Separator className="bg-[#E2DFD6]" />
        <Controller
          name="lat"
          control={control}
          render={({ field: latField }) => (
            <Controller
              name="lng"
              control={control}
              render={({ field: lngField }) => (
                <MapboxPicker
                  lat={latField.value}
                  lng={lngField.value}
                  onLocationChange={(lat, lng) => {
                    latField.onChange(lat)
                    lngField.onChange(lng)
                  }}
                />
              )}
            />
          )}
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 pb-8">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleSubmit((data: any) => save(data, false))}
          className="cursor-pointer"
        >
          Guardar borrador
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={handleSubmit((data: any) => save(data, true))}
          className="bg-[#1C3311] hover:bg-[#254516] cursor-pointer"
        >
          {loading ? 'Guardando...' : 'Publicar campo'}
        </Button>
      </div>
    </form>
  )
}
