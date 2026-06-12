'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { Sparkles, MapPin, FileText, ImageIcon, Map, Loader2, Droplets, Route, Layers } from 'lucide-react'
import CampoCaracteristicas from './CampoCaracteristicas'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import GaleriaFotos from './GaleriaFotos'
import type { Campo } from '@/lib/types'
import VoiceRecorder, { type CampoVozFields } from './VoiceRecorder'

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
  tipo: z.enum(['ganadero', 'agricola', 'forestal', 'mixto', 'turistica']).optional(),
  precio_usd: z.preprocess(v => (!v && v !== 0 ? undefined : Number(v)), z.number().positive().optional()),
  descripcion: z.string().optional(),
  agua: z.boolean(),
  acceso_ruta: z.boolean(),
  coneat: z.preprocess(v => (!v && v !== 0 ? undefined : Number(v)), z.number().min(0).optional()),
  caracteristicas: z.array(z.string()),
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

function SectionCard({ icon: Icon, title, children, action }: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F7F5F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#C49A3C]/10 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-[#8B6914]" />
          </div>
          <h2 className="text-[13.5px] font-semibold text-[#1A1A12]">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6 space-y-5">
        {children}
      </div>
    </div>
  )
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[12.5px] font-medium text-[#2A2A1E]">
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-[11.5px] text-red-500 flex items-center gap-1.5 mt-1">
      <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
      {message}
    </p>
  )
}

const inputCls = "h-11 rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-[#1A1A12] text-sm placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150"


export default function CampoForm({ initialData }: Props) {
  const router = useRouter()
  const [campoId] = useState(() => initialData?.id ?? crypto.randomUUID())
  const [generatingAI, setGeneratingAI] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transcripcion, setTranscripcion] = useState<string | null>(null)

  const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
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
      coneat: initialData?.coneat ?? ('' as any),
      caracteristicas: initialData?.caracteristicas ?? [],
      video_url: initialData?.video_url ?? '',
      estado: (initialData?.estado === 'archivado' || initialData?.estado === 'vendido' ? 'publicado' : initialData?.estado) ?? 'borrador',
      lat: initialData?.lat ?? undefined,
      lng: initialData?.lng ?? undefined,
      fotos: initialData?.fotos ?? [],
    },
  })

  const fotos = watch('fotos')

  function handleFieldsExtracted(fields: CampoVozFields) {
    if (fields.titulo) setValue('titulo', fields.titulo)
    if (fields.departamento) setValue('departamento', fields.departamento)
    if (fields.hectareas) setValue('hectareas', fields.hectareas)
    if (fields.tipo) setValue('tipo', fields.tipo)
    if (fields.precio_usd) setValue('precio_usd', fields.precio_usd)
    if (fields.agua !== undefined && fields.agua !== null) setValue('agua', fields.agua)
    if (fields.acceso_ruta !== undefined && fields.acceso_ruta !== null) setValue('acceso_ruta', fields.acceso_ruta)
  }

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
        body: JSON.stringify({ titulo, hectareas, departamento, tipo, precio_usd, agua, acceso_ruta, transcripcion }),
      })
      const json = await res.json()
      if (json.descripcion) {
        setValue('descripcion', json.descripcion)
        toast.success('Descripción generada con IA.')
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
        coneat: data.coneat ?? null,
        caracteristicas: data.caracteristicas,
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

      if (error) { toast.error('Error al guardar el campo.'); return }

      toast.success(publicar ? 'Campo publicado.' : 'Borrador guardado.')
      router.push('/dashboard/campos')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-5 max-w-2xl">

      {/* Voice recorder */}
      <VoiceRecorder
        onFieldsExtracted={handleFieldsExtracted}
        onTranscripcionReady={texto => setTranscripcion(texto)}
      />

      {/* ── Datos básicos ── */}
      <SectionCard icon={MapPin} title="Datos básicos">
        <FieldGroup>
          <FieldLabel htmlFor="titulo">Título del campo *</FieldLabel>
          <Input
            id="titulo"
            {...register('titulo')}
            placeholder="Ej: Campo ganadero en Tacuarembó"
            className={inputCls}
          />
          <FieldError message={errors.titulo?.message} />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup>
            <FieldLabel>Departamento *</FieldLabel>
            <Controller
              name="departamento"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={inputCls + ' w-full'}>
                    <SelectValue placeholder="Seleccioná..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTAMENTOS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.departamento?.message} />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="hectareas">Hectáreas *</FieldLabel>
            <Input
              id="hectareas"
              type="number"
              step="0.1"
              min="0"
              {...register('hectareas')}
              placeholder="250"
              className={inputCls}
            />
            <FieldError message={errors.hectareas?.message} />
          </FieldGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup>
            <FieldLabel>Tipo de campo</FieldLabel>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={v => field.onChange(v || undefined)}>
                  <SelectTrigger className={inputCls + ' w-full'}>
                    <SelectValue placeholder="Seleccioná..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ganadero">Ganadero</SelectItem>
                    <SelectItem value="agricola">Agrícola</SelectItem>
                    <SelectItem value="forestal">Forestal</SelectItem>
                    <SelectItem value="mixto">Mixto</SelectItem>
                    <SelectItem value="turistica">Turístico</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="precio_usd">Precio (USD)</FieldLabel>
            <Input
              id="precio_usd"
              type="number"
              min="0"
              {...register('precio_usd')}
              placeholder="Opcional"
              className={inputCls}
            />
          </FieldGroup>
        </div>

        <FieldGroup>
          <FieldLabel htmlFor="coneat">
            Índice CONEAT <span className="font-normal text-[#8B8A7E]">(opcional)</span>
          </FieldLabel>
          <div className="flex items-center gap-3">
            <Input
              id="coneat"
              type="number"
              step="0.01"
              min="0"
              {...register('coneat')}
              placeholder="Ej. 87.5"
              className={inputCls + ' max-w-[180px]'}
            />
            <p className="text-[12px] text-[#8B8A7E]">Índice de productividad del suelo</p>
          </div>
        </FieldGroup>

        {/* Toggle row */}
        <div className="flex items-center gap-6 pt-1">
          <div className="flex items-center gap-3">
            <Controller
              name="agua"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="agua"
                  className="data-[state=checked]:bg-[#1C3311]"
                />
              )}
            />
            <label htmlFor="agua" className="flex items-center gap-1.5 text-[13px] font-medium text-[#2A2A1E] cursor-pointer">
              <Droplets className="h-3.5 w-3.5 text-blue-500" />
              Fuente de agua
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Controller
              name="acceso_ruta"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="acceso_ruta"
                  className="data-[state=checked]:bg-[#1C3311]"
                />
              )}
            />
            <label htmlFor="acceso_ruta" className="flex items-center gap-1.5 text-[13px] font-medium text-[#2A2A1E] cursor-pointer">
              <Route className="h-3.5 w-3.5 text-[#2D5018]" />
              Acceso por ruta
            </label>
          </div>
        </div>
      </SectionCard>

      {/* ── Características ── */}
      <SectionCard icon={Layers} title="Características">
        <Controller
          name="caracteristicas"
          control={control}
          render={({ field }) => (
            <CampoCaracteristicas value={field.value} onChange={field.onChange} />
          )}
        />
      </SectionCard>

      {/* ── Descripción ── */}
      <SectionCard
        icon={FileText}
        title="Descripción"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={generatingAI}
            onClick={generateDescription}
            className="h-8 gap-1.5 text-[12px] border-[#C49A3C]/35 text-[#8B6914] hover:bg-[#C49A3C]/8 hover:border-[#C49A3C]/50 transition-all duration-150 cursor-pointer rounded-lg"
          >
            {generatingAI
              ? <><Loader2 className="h-3 w-3 animate-spin" />Generando...</>
              : <><Sparkles className="h-3 w-3" />Generar con IA</>
            }
          </Button>
        }
      >
        <Textarea
          {...register('descripcion')}
          placeholder="Describí las características del campo: tipo de suelo, instalaciones, accesos, aguadas..."
          rows={6}
          className="rounded-xl border-[#E2DFD6] bg-[#F9F8F5] text-sm text-[#1A1A12] placeholder:text-[#C2BFB5] focus-visible:border-[#C49A3C] focus-visible:ring-2 focus-visible:ring-[#C49A3C]/20 transition-all duration-150 resize-none leading-relaxed"
        />
      </SectionCard>

      {/* ── Fotos y video ── */}
      <SectionCard icon={ImageIcon} title="Fotos y video">
        <Controller
          name="fotos"
          control={control}
          render={({ field }) => (
            <GaleriaFotos campoId={campoId} fotos={field.value} onChange={field.onChange} />
          )}
        />
        <div className="pt-2 border-t border-[#F7F5F0]">
          <FieldGroup>
            <FieldLabel htmlFor="video_url">URL de video (YouTube o Vimeo)</FieldLabel>
            <Input
              id="video_url"
              {...register('video_url')}
              placeholder="https://youtube.com/watch?v=..."
              className={inputCls}
            />
            <FieldError message={errors.video_url?.message} />
          </FieldGroup>
        </div>
      </SectionCard>

      {/* ── Ubicación ── */}
      <SectionCard icon={Map} title="Ubicación en el mapa">
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
      </SectionCard>

      {/* ── Acciones ── */}
      <div className="flex items-center gap-3 pb-8 pt-1">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleSubmit((data: any) => save(data, false))}
          className="h-11 rounded-xl border-[#E2DFD6] text-[#5C5B4F] hover:text-[#1A1A12] hover:border-[#C49A3C]/40 hover:bg-[#F7F5F0] transition-all duration-150 cursor-pointer font-medium"
        >
          Guardar borrador
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={handleSubmit((data: any) => save(data, true))}
          className="h-11 rounded-xl bg-[#1C3311] hover:bg-[#254516] active:scale-[0.98] text-white font-semibold shadow-[0_2px_8px_-2px_rgba(28,51,17,0.4)] hover:shadow-[0_4px_14px_-4px_rgba(28,51,17,0.5)] transition-all duration-200 cursor-pointer"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</>
            : 'Publicar campo'
          }
        </Button>
      </div>
    </form>
  )
}
