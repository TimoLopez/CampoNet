import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { MapPin, Ruler, Droplets, Route, Tag, Phone, Sprout } from 'lucide-react'
import ContactForm from './ContactForm'
import VisitTracker from './VisitTracker'
import Link from 'next/link'
import MapaWrapper from './MapaWrapper'

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

const TIPO_COLOR: Record<string, string> = {
  ganadero: 'bg-amber-50 text-amber-700 border-amber-200/80',
  agricola:  'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  forestal:  'bg-teal-50 text-teal-700 border-teal-200/80',
  mixto:     'bg-violet-50 text-violet-700 border-violet-200/80',
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
  const fotos: string[] = campo.fotos ?? []
  const primeraFoto = fotos[0] ?? null
  const fotosGaleria: string[] = fotos.slice(1)

  return (
    <>
      <VisitTracker campoId={id} />

      <div className="min-h-screen bg-[#F7F5F0]">

        {/* ── Navbar ── */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#E8E5DD]">
          <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-7 h-7 rounded-lg bg-[#1C3311] flex items-center justify-center">
                <Sprout className="h-4 w-4 text-[#C49A3C]" />
              </div>
              <span className="text-[14px] font-semibold text-[#1A1A12] tracking-wide">
                Campo<span className="text-[#2D5018]">Net</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5 text-[12px] text-[#8B8A7E]">
              <MapPin className="h-3.5 w-3.5" />
              <span>{campo.departamento}</span>
            </div>
          </div>
        </header>

        {/* ── Hero image ── */}
        <div className="relative w-full h-72 md:h-[480px] bg-[#E2DFD6] overflow-hidden">
          {primeraFoto ? (
            <img
              src={primeraFoto}
              alt={campo.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <MapPin className="h-16 w-16 text-[#C2BFB5]" />
              <span className="text-sm text-[#C2BFB5]">Sin foto</span>
            </div>
          )}
          {/* Gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

          {/* Tipo badge overlay */}
          {campo.tipo && (
            <div className="absolute top-5 left-5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border backdrop-blur-sm ${TIPO_COLOR[campo.tipo] ?? 'bg-white/80 text-[#1A1A12] border-white/60'}`}>
                <Tag className="h-3.5 w-3.5" />
                {TIPO_LABEL[campo.tipo] ?? campo.tipo}
              </span>
            </div>
          )}

          {/* Price overlay on image (bottom) */}
          {campo.precio_usd && (
            <div className="absolute bottom-5 left-5">
              <div className="inline-flex items-baseline gap-1.5 bg-[#1C3311]/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                <span className="text-[12px] font-medium text-[#C49A3C]/80">USD</span>
                <span className="text-[22px] font-bold text-white tabular-nums">
                  {Number(campo.precio_usd).toLocaleString('es-UY')}
                </span>
                {campo.precio_ha_usd && (
                  <span className="text-[12px] text-white/50 ml-1">
                    · {Math.round(Number(campo.precio_ha_usd)).toLocaleString('es-UY')}/ha
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: primary content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title block */}
            <div>
              <div className="flex items-center gap-2 text-[12.5px] text-[#8B6914] mb-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{campo.departamento}</span>
              </div>
              <h1 className="text-[28px] md:text-[34px] font-bold text-[#1A1A12] tracking-tight leading-tight">
                {campo.titulo}
              </h1>
            </div>

            {/* Key stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-[#E2DFD6] p-4 text-center shadow-[var(--shadow-card)]">
                <Ruler className="h-5 w-5 text-[#8B6914] mx-auto mb-1.5" />
                <p className="text-[20px] font-bold text-[#1A1A12] tabular-nums">{campo.hectareas}</p>
                <p className="text-[11px] text-[#8B8A7E] mt-0.5">hectáreas</p>
              </div>
              {campo.agua && (
                <div className="bg-white rounded-2xl border border-[#E2DFD6] p-4 text-center shadow-[var(--shadow-card)]">
                  <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1.5" />
                  <p className="text-[13px] font-semibold text-[#1A1A12]">Agua</p>
                  <p className="text-[11px] text-[#8B8A7E] mt-0.5">disponible</p>
                </div>
              )}
              {campo.acceso_ruta && (
                <div className="bg-white rounded-2xl border border-[#E2DFD6] p-4 text-center shadow-[var(--shadow-card)]">
                  <Route className="h-5 w-5 text-[#2D5018] mx-auto mb-1.5" />
                  <p className="text-[13px] font-semibold text-[#1A1A12]">Acceso</p>
                  <p className="text-[11px] text-[#8B8A7E] mt-0.5">por ruta</p>
                </div>
              )}
              {campo.tipo && (
                <div className="bg-white rounded-2xl border border-[#E2DFD6] p-4 text-center shadow-[var(--shadow-card)]">
                  <Tag className="h-5 w-5 text-[#8B6914] mx-auto mb-1.5" />
                  <p className="text-[13px] font-semibold text-[#1A1A12]">{TIPO_LABEL[campo.tipo]}</p>
                  <p className="text-[11px] text-[#8B8A7E] mt-0.5">tipo</p>
                </div>
              )}
            </div>

            {/* Description */}
            {campo.descripcion && (
              <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-[13.5px] font-semibold text-[#1A1A12] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-[#C49A3C] inline-block" />
                  Descripción
                </h2>
                <p className="text-[14px] text-[#5C5B4F] leading-[1.75] whitespace-pre-line">
                  {campo.descripcion}
                </p>
              </div>
            )}

            {/* Photo gallery */}
            {fotosGaleria.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-[13.5px] font-semibold text-[#1A1A12] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-[#C49A3C] inline-block" />
                  Galería de fotos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotosGaleria.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden group cursor-pointer">
                      <img
                        src={url}
                        alt={`Foto ${i + 2}`}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {campo.video_url && (
              <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-[13.5px] font-semibold text-[#1A1A12] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-[#C49A3C] inline-block" />
                  Video
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-[#F2EFE8]">
                  <iframe
                    src={campo.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video del campo"
                  />
                </div>
              </div>
            )}

            {/* Mapa */}
            {campo.lat && campo.lng && (
              <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-[13.5px] font-semibold text-[#1A1A12] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-[#C49A3C] inline-block" />
                  Ubicación
                </h2>
                <MapaWrapper lat={campo.lat} lng={campo.lng} titulo={campo.titulo} />
                <p className="text-[11.5px] text-[#8B8A7E] mt-3 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {campo.departamento} · ubicación aproximada
                </p>
              </div>
            )}

            {/* Escritorio card */}
            <div className="bg-white rounded-2xl border border-[#E2DFD6] p-5 flex items-center gap-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200">
              {escritorio.logo_url ? (
                <img
                  src={escritorio.logo_url}
                  alt={escritorio.nombre}
                  className="h-12 w-12 rounded-2xl object-cover border border-[#E2DFD6] shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-[#1C3311] flex items-center justify-center text-[#C49A3C] text-[16px] font-bold shrink-0">
                  {escritorio.nombre[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[12px] text-[#8B8A7E] mb-0.5">Publicado por</p>
                <p className="font-semibold text-[#1A1A12] text-[14px]">{escritorio.nombre}</p>
                {escritorio.telefono && (
                  <a
                    href={`tel:${escritorio.telefono}`}
                    className="flex items-center gap-1.5 text-[12.5px] text-[#8B6914] hover:text-[#C49A3C] transition-colors mt-0.5"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {escritorio.telefono}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: sticky contact form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[var(--shadow-lg)] lg:sticky lg:top-24 overflow-hidden">
              <div className="h-[3px] bg-gradient-to-r from-[#1C3311] via-[#3D6B22] to-[#C49A3C]" />
              <div className="p-6">
                <h2 className="text-[15px] font-semibold text-[#1A1A12] mb-1">Consultar sobre este campo</h2>
                <p className="text-[12px] text-[#8B8A7E] mb-5">El escritorio te responderá a la brevedad</p>
                <ContactForm campoId={id} />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="border-t border-[#E8E5DD] py-6 mt-4">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-center text-[12px] text-[#C2BFB5]">
              © 2026 CampoNet · Uruguay · Plataforma de compraventa de campos rurales
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
