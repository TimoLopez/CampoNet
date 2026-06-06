import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { MapPin, Ruler, Droplets, Route, Tag, Phone, Building2 } from 'lucide-react'
import ContactForm from './ContactForm'
import VisitTracker from './VisitTracker'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TIPO_LABEL: Record<string, string> = {
  ganadero: 'Ganadero',
  agricola: 'Agrícola',
  forestal: 'Forestal',
  mixto: 'Mixto',
}

export default async function CampoPublicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: campo } = await supabaseAdmin
    .from('campos')
    .select('*, escritorios(nombre, telefono, logo_url)')
    .eq('id', id)
    .eq('estado', 'publicado')
    .single()

  if (!campo) notFound()

  const escritorio = campo.escritorios as { nombre: string; telefono: string | null; logo_url: string | null }
  const primeraFoto = campo.fotos?.[0] ?? null
  const fotosRestantes: string[] = campo.fotos?.slice(1) ?? []

  return (
    <>
      <VisitTracker campoId={id} />
      <div className="min-h-screen bg-[#F7F5F0]">

        {/* Navbar mínimo */}
        <header className="bg-white border-b border-[#E2DFD6] px-6 py-3 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#1C3311]" />
          <span className="font-semibold text-[#1A1A12] text-sm">CampoNet</span>
        </header>

        {/* Hero */}
        <div className="w-full h-64 md:h-96 bg-[#E2DFD6] overflow-hidden">
          {primeraFoto ? (
            <img src={primeraFoto} alt={campo.titulo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-20 w-20 text-[#C2BFB5]" />
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Título y precio */}
            <div>
              <div className="flex items-center gap-2 text-sm text-[#8B6914] mb-1">
                <MapPin className="h-4 w-4" />
                <span>{campo.departamento}</span>
                {campo.tipo && <><span>·</span><span>{TIPO_LABEL[campo.tipo] ?? campo.tipo}</span></>}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A12]" style={{ fontFamily: 'var(--font-playfair)' }}>
                {campo.titulo}
              </h1>
              {campo.precio_usd && (
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-semibold text-[#1C3311]">
                    USD {Number(campo.precio_usd).toLocaleString('es-UY')}
                  </p>
                  {campo.precio_ha_usd && (
                    <p className="text-sm text-[#5C5B4F]">
                      · USD {Math.round(Number(campo.precio_ha_usd)).toLocaleString('es-UY')}/ha
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Stats clave */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-[#E2DFD6] p-4 text-center">
                <Ruler className="h-5 w-5 text-[#8B6914] mx-auto mb-1" />
                <p className="text-xl font-bold text-[#1A1A12]">{campo.hectareas}</p>
                <p className="text-xs text-[#5C5B4F]">hectáreas</p>
              </div>
              {campo.agua && (
                <div className="bg-white rounded-xl border border-[#E2DFD6] p-4 text-center">
                  <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-medium text-[#1A1A12]">Agua</p>
                  <p className="text-xs text-[#5C5B4F]">disponible</p>
                </div>
              )}
              {campo.acceso_ruta && (
                <div className="bg-white rounded-xl border border-[#E2DFD6] p-4 text-center">
                  <Route className="h-5 w-5 text-[#2D5018] mx-auto mb-1" />
                  <p className="text-sm font-medium text-[#1A1A12]">Acceso</p>
                  <p className="text-xs text-[#5C5B4F]">por ruta</p>
                </div>
              )}
              {campo.tipo && (
                <div className="bg-white rounded-xl border border-[#E2DFD6] p-4 text-center">
                  <Tag className="h-5 w-5 text-[#8B6914] mx-auto mb-1" />
                  <p className="text-sm font-medium text-[#1A1A12]">{TIPO_LABEL[campo.tipo]}</p>
                  <p className="text-xs text-[#5C5B4F]">tipo</p>
                </div>
              )}
            </div>

            {/* Descripción */}
            {campo.descripcion && (
              <div className="bg-white rounded-xl border border-[#E2DFD6] p-6">
                <h2 className="font-semibold text-[#1A1A12] mb-3">Descripción</h2>
                <p className="text-[#5C5B4F] leading-relaxed whitespace-pre-line">{campo.descripcion}</p>
              </div>
            )}

            {/* Galería de fotos restantes */}
            {fotosRestantes.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E2DFD6] p-6">
                <h2 className="font-semibold text-[#1A1A12] mb-3">Fotos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotosRestantes.map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video embed */}
            {campo.video_url && (
              <div className="bg-white rounded-xl border border-[#E2DFD6] p-6">
                <h2 className="font-semibold text-[#1A1A12] mb-3">Video</h2>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={campo.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Escritorio */}
            <div className="bg-white rounded-xl border border-[#E2DFD6] p-5 flex items-center gap-4">
              {escritorio.logo_url ? (
                <img
                  src={escritorio.logo_url}
                  alt={escritorio.nombre}
                  className="h-12 w-12 rounded-full object-cover border border-[#E2DFD6]"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-[#1C3311] flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {escritorio.nombre[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#1A1A12]">{escritorio.nombre}</p>
                {escritorio.telefono && (
                  <div className="flex items-center gap-1 text-sm text-[#5C5B4F]">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{escritorio.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar — formulario de contacto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 lg:sticky lg:top-6">
              <h2 className="font-semibold text-[#1A1A12] mb-1">Consultar sobre este campo</h2>
              <p className="text-xs text-[#5C5B4F] mb-4">El escritorio te responderá a la brevedad</p>
              <ContactForm campoId={id} />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
