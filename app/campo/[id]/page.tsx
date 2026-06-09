import { notFound } from "next/navigation"
import {
  MapPin,
  Ruler,
  Droplets,
  Route,
  Tag,
  Phone,
  Sprout,
  ShieldCheck,
  Camera,
  BadgeCheck,
  Sparkles,
  Building2,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import ContactForm from "./ContactForm"
import VisitTracker from "./VisitTracker"
import Link from "next/link"
import MapaWrapper from "./MapaWrapper"
import { getCampoPublico } from "@/lib/dal/campos"
import ShareCampoButton from "@/components/ShareCampoButton"

const TIPO_LABEL: Record<string, string> = {
  ganadero: "Ganadero",
  agricola: "Agrícola",
  forestal: "Forestal",
  mixto: "Mixto",
}

const TIPO_ACCENT: Record<string, { dot: string; text: string; ring: string }> = {
  ganadero: { dot: "bg-amber-400", text: "text-amber-100", ring: "ring-amber-300/30" },
  agricola: { dot: "bg-emerald-400", text: "text-emerald-100", ring: "ring-emerald-300/30" },
  forestal: { dot: "bg-teal-400", text: "text-teal-100", ring: "ring-teal-300/30" },
  mixto: { dot: "bg-violet-400", text: "text-violet-100", ring: "ring-violet-300/30" },
}

export default async function CampoPublicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const campo = await getCampoPublico(id)
  if (!campo) notFound()

  const escritorio = campo.escritorios
  const fotos: string[] = campo.fotos ?? []
  const primeraFoto = fotos[0] ?? null
  const tipoAccent = campo.tipo ? (TIPO_ACCENT[campo.tipo] ?? null) : null

  return (
    <>
      <VisitTracker campoId={id} />

      {/* Keyframes + design primitives — scoped, no extra deps */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes cnFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes cnFade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes cnScaleIn { from { opacity: 0; transform: scale(1.06); } to { opacity: 1; transform: scale(1); } }
            @keyframes cnShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            @keyframes cnFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            .cn-reveal { opacity: 0; animation: cnFadeUp .7s cubic-bezier(.22,.61,.36,1) forwards; }
            .cn-hero-img { animation: cnScaleIn 1.4s cubic-bezier(.22,.61,.36,1) forwards; }
            .cn-pulse-dot { animation: cnFloat 3s ease-in-out infinite; }
            .cn-glass { background: rgba(255,255,255,.7); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%); }
            .cn-glass-dark { background: rgba(20,32,14,.55); backdrop-filter: blur(16px) saturate(140%); -webkit-backdrop-filter: blur(16px) saturate(140%); }
            .cn-card { transition: transform .35s cubic-bezier(.22,.61,.36,1), box-shadow .35s cubic-bezier(.22,.61,.36,1), border-color .35s ease; }
            .cn-card:hover { transform: translateY(-4px); box-shadow: 0 24px 50px -24px rgba(28,51,17,.35); border-color: rgba(196,154,60,.45); }
            .cn-gallery-item img { transition: transform .7s cubic-bezier(.22,.61,.36,1), filter .5s ease; }
            .cn-gallery-item:hover img { transform: scale(1.04); filter: saturate(1.08); }
            /* In-page lightbox via :target — no JS, stays a server component */
            .cn-lightbox { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 4vh 4vw; background: rgba(8,12,5,.92); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); opacity: 0; visibility: hidden; transition: opacity .3s ease, visibility .3s ease; }
            .cn-lightbox:target { opacity: 1; visibility: visible; }
            .cn-lightbox img { max-width: 100%; max-height: 92vh; width: auto; height: auto; object-fit: contain; border-radius: 14px; box-shadow: 0 40px 80px -20px rgba(0,0,0,.8); transform: scale(.96); transition: transform .35s cubic-bezier(.22,.61,.36,1); }
            .cn-lightbox:target img { transform: scale(1); }
            .cn-lb-backdrop { position: absolute; inset: 0; cursor: zoom-out; }
            @media (prefers-reduced-motion: reduce) {
              .cn-reveal, .cn-hero-img, .cn-pulse-dot { animation: none; opacity: 1; transform: none; }
              .cn-lightbox img { transform: none; }
            }
          `,
        }}
      />

      <div className="min-h-screen bg-[#F4F2EB] text-[#1A1A12] selection:bg-[#C49A3C]/25 antialiased">
        {/* ── Navbar ── */}
        <header className="sticky top-0 z-40 cn-glass border-b border-[#E4E0D6]">
          <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#1C3311] flex items-center justify-center shadow-[0_6px_16px_-6px_rgba(28,51,17,.6)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <Sprout className="h-4 w-4 text-[#C49A3C]" />
              </div>
              <span className="text-[15px] font-semibold tracking-tight">
                Campo<span className="text-[#2D5018]">Net</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 text-[11.5px] font-medium text-[#7A7A6E]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#2D5018]" />
                <span>Propiedad verificada</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#5C5B4F] rounded-full bg-white/70 border border-[#E4E0D6] px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#8B6914]" />
                <span className="font-medium">{campo.departamento}</span>
              </div>
              <ShareCampoButton campoId={id} titulo={campo.titulo} variant="public" />
            </div>
          </div>
        </header>

        {/* ── Cinematic hero ── */}
        <section className="relative w-full h-[78vh] min-h-[520px] max-h-[820px] overflow-hidden bg-[#16200E]">
          {primeraFoto ? (
            <img
              src={primeraFoto || "/placeholder.svg"}
              alt={campo.titulo}
              className="cn-hero-img absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1C2A12]">
              <MapPin className="h-16 w-16 text-[#3D5226]" />
              <span className="text-sm text-[#586B3D]">Sin foto</span>
            </div>
          )}

          {/* Layered cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1206]/85 via-[#0B1206]/15 to-[#0B1206]/35 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(11,18,6,.7),transparent)] pointer-events-none" />

          {/* Top floating badges */}
          <div className="absolute top-6 left-0 right-0 z-10">
            <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
              {campo.tipo && tipoAccent && (
                <span
                  className={`cn-reveal inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold cn-glass-dark border border-white/15 ring-1 ${tipoAccent.ring} ${tipoAccent.text}`}
                  style={{ animationDelay: "0.1s" }}
                >
                  <span className={`cn-pulse-dot w-1.5 h-1.5 rounded-full ${tipoAccent.dot}`} />
                  {TIPO_LABEL[campo.tipo] ?? campo.tipo}
                </span>
              )}
              {fotos.length > 0 && (
                <span
                  className="cn-reveal inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium cn-glass-dark border border-white/15 text-white/85"
                  style={{ animationDelay: "0.15s" }}
                >
                  <Camera className="h-3.5 w-3.5" />
                  {fotos.length} {fotos.length === 1 ? "foto" : "fotos"}
                </span>
              )}
            </div>
          </div>

          {/* Hero content */}
          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="max-w-6xl mx-auto px-5 pb-10 md:pb-14">
              <div className="grid md:grid-cols-[1fr_auto] gap-6 md:items-end">
                <div className="max-w-2xl">
                  <div
                    className="cn-reveal flex items-center gap-2 text-[12.5px] font-medium text-[#E4C77A] mb-3"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{campo.departamento}, Uruguay</span>
                  </div>
                  <h1
                    className="cn-reveal text-[32px] md:text-[52px] leading-[1.04] font-bold tracking-tight text-white text-balance drop-shadow-[0_2px_20px_rgba(0,0,0,.35)]"
                    style={{ animationDelay: "0.28s" }}
                  >
                    {campo.titulo}
                  </h1>
                  <div
                    className="cn-reveal flex flex-wrap items-center gap-2.5 mt-5"
                    style={{ animationDelay: "0.36s" }}
                  >
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-white/90 cn-glass-dark border border-white/15 rounded-full px-3 py-1.5">
                      <Ruler className="h-3.5 w-3.5 text-[#E4C77A]" />
                      {campo.hectareas} ha
                    </span>
                    {campo.agua && (
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-white/90 cn-glass-dark border border-white/15 rounded-full px-3 py-1.5">
                        <Droplets className="h-3.5 w-3.5 text-sky-300" />
                        Agua
                      </span>
                    )}
                    {campo.acceso_ruta && (
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-white/90 cn-glass-dark border border-white/15 rounded-full px-3 py-1.5">
                        <Route className="h-3.5 w-3.5 text-emerald-300" />
                        Acceso por ruta
                      </span>
                    )}
                  </div>
                </div>

                {/* Floating price panel */}
                {campo.precio_usd && (
                  <div
                    className="cn-reveal cn-glass-dark rounded-2xl border border-white/15 px-6 py-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)] md:min-w-[230px]"
                    style={{ animationDelay: "0.42s" }}
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/55 mb-1.5">Precio de venta</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[13px] font-semibold text-[#E4C77A]">USD</span>
                      <span className="text-[30px] md:text-[34px] font-bold text-white tabular-nums leading-none">
                        {Number(campo.precio_usd).toLocaleString("es-UY")}
                      </span>
                    </div>
                    {campo.precio_ha_usd && (
                      <p className="text-[12px] text-white/55 mt-2 pt-2 border-t border-white/10">
                        {Math.round(Number(campo.precio_ha_usd)).toLocaleString("es-UY")} USD / hectárea
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Main content ── */}
        <div className="max-w-6xl mx-auto px-5 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-7">
            {/* Premium stat dashboard */}
            <div
              className="cn-reveal grid grid-cols-2 lg:grid-cols-4 gap-3.5"
              style={{ animationDelay: "0.05s" }}
            >
              <div className="cn-card group relative overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white p-5">
                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-[#C49A3C]/10 blur-xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
                <div className="w-9 h-9 rounded-xl bg-[#C49A3C]/12 flex items-center justify-center mb-3">
                  <Ruler className="h-4.5 w-4.5 text-[#8B6914]" />
                </div>
                <p className="text-[26px] font-bold tabular-nums leading-none">{campo.hectareas}</p>
                <p className="text-[11.5px] text-[#8B8A7E] mt-1.5">hectáreas totales</p>
              </div>

              <div className="cn-card group relative overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white p-5">
                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-sky-400/10 blur-xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
                <div className="w-9 h-9 rounded-xl bg-sky-500/12 flex items-center justify-center mb-3">
                  <Droplets className="h-4.5 w-4.5 text-sky-600" />
                </div>
                <p className="text-[16px] font-semibold leading-none">{campo.agua ? "Disponible" : "Consultar"}</p>
                <p className="text-[11.5px] text-[#8B8A7E] mt-1.5">acceso a agua</p>
              </div>

              <div className="cn-card group relative overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white p-5">
                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-emerald-400/10 blur-xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
                <div className="w-9 h-9 rounded-xl bg-emerald-500/12 flex items-center justify-center mb-3">
                  <Route className="h-4.5 w-4.5 text-emerald-700" />
                </div>
                <p className="text-[16px] font-semibold leading-none">{campo.acceso_ruta ? "Por ruta" : "Consultar"}</p>
                <p className="text-[11.5px] text-[#8B8A7E] mt-1.5">tipo de acceso</p>
              </div>

              <div className="cn-card group relative overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white p-5">
                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-[#C49A3C]/10 blur-xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
                <div className="w-9 h-9 rounded-xl bg-[#1C3311]/8 flex items-center justify-center mb-3">
                  <Tag className="h-4.5 w-4.5 text-[#2D5018]" />
                </div>
                <p className="text-[16px] font-semibold leading-none">
                  {campo.tipo ? (TIPO_LABEL[campo.tipo] ?? campo.tipo) : "—"}
                </p>
                <p className="text-[11.5px] text-[#8B8A7E] mt-1.5">tipo de campo</p>
              </div>
            </div>

            {/* Editorial description — prominent, justified, no boxed card */}
            {campo.descripcion && (
              <section
                className="cn-reveal relative pl-6 md:pl-8"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-[#1C3311] via-[#3D6B22] to-[#C49A3C]" />
                <div className="flex items-center gap-2.5 mb-5">
                  <Sparkles className="h-4 w-4 text-[#C49A3C]" />
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8B6914]">
                    Sobre la propiedad
                  </h2>
                </div>
                <div className="space-y-5 text-[18px] md:text-[20px] leading-[1.9] text-[#2B2A22] [text-align:justify] [text-justify:inter-word] hyphens-auto">
                  {campo.descripcion
                    .split(/\n{2,}/)
                    .map((parrafo: string) => parrafo.trim())
                    .filter(Boolean)
                    .map((parrafo: string, p: number) => (
                      <p
                        key={p}
                        className={
                          p === 0
                            ? "first-letter:text-[52px] md:first-letter:text-[60px] first-letter:font-bold first-letter:text-[#1C3311] first-letter:mr-2.5 first-letter:float-left first-letter:leading-[0.82] first-letter:mt-1.5"
                            : ""
                        }
                      >
                        {parrafo}
                      </p>
                    ))}
                </div>
              </section>
            )}

            {/* Immersive gallery — all photos, in-page lightbox */}
            {fotos.length > 0 && (
              <section id="galeria" className="cn-reveal scroll-mt-24" style={{ animationDelay: "0.12s" }}>
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2.5">
                    <Camera className="h-4 w-4 text-[#C49A3C]" />
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8B6914]">
                      Galería de la propiedad
                    </h2>
                  </div>
                  <span className="text-[11.5px] text-[#8B8A7E]">
                    {fotos.length} {fotos.length === 1 ? "imagen" : "imágenes"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 [grid-auto-flow:dense]">
                  {fotos.map((url, i) => (
                    <a
                      key={i}
                      href={`#foto-${i}`}
                      className={`cn-gallery-item group relative block overflow-hidden rounded-2xl border border-[#E4E0D6] bg-[#E2DFD6] cursor-zoom-in ${
                        i % 5 === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-[4/3]" : "aspect-square"
                      }`}
                    >
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Foto ${i + 1} de ${campo.titulo}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full cn-glass-dark border border-white/20 flex items-center justify-center text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <Maximize2 className="h-4 w-4" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* In-page lightbox overlays (one per photo) */}
            {fotos.map((url, i) => {
              const prev = (i - 1 + fotos.length) % fotos.length
              const next = (i + 1) % fotos.length
              return (
                <div key={`lb-${i}`} id={`foto-${i}`} className="cn-lightbox">
                  <a href="#galeria" className="cn-lb-backdrop" aria-label="Cerrar" />
                  <img src={url || "/placeholder.svg"} alt={`Foto ${i + 1} de ${campo.titulo}`} />
                  <a
                    href="#galeria"
                    aria-label="Cerrar"
                    className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full cn-glass-dark border border-white/20 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </a>
                  <span className="absolute top-6 left-6 z-10 text-[12.5px] font-medium text-white/80 cn-glass-dark border border-white/15 rounded-full px-3.5 py-1.5">
                    {i + 1} / {fotos.length}
                  </span>
                  {fotos.length > 1 && (
                    <>
                      <a
                        href={`#foto-${prev}`}
                        aria-label="Foto anterior"
                        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full cn-glass-dark border border-white/20 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </a>
                      <a
                        href={`#foto-${next}`}
                        aria-label="Foto siguiente"
                        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full cn-glass-dark border border-white/20 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </a>
                    </>
                  )}
                </div>
              )
            })}
            {campo.video_url && (
              <section
                className="cn-reveal rounded-3xl border border-[#E4E0D6] bg-white p-7 shadow-[0_1px_2px_rgba(28,51,17,.04)]"
                style={{ animationDelay: "0.14s" }}
              >
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C49A3C]" />
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8B6914]">
                    Recorrido en video
                  </h2>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden bg-[#F2EFE8] ring-1 ring-[#E4E0D6]">
                  <iframe
                    src={campo.video_url.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video del campo"
                  />
                </div>
              </section>
            )}

            {/* Integrated map */}
            {campo.lat && campo.lng && (
              <section
                className="cn-reveal relative overflow-hidden rounded-3xl border border-[#E4E0D6] bg-white shadow-[0_1px_2px_rgba(28,51,17,.04)]"
                style={{ animationDelay: "0.16s" }}
              >
                <div className="flex items-center justify-between px-7 pt-6 pb-4">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-[#C49A3C]" />
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8B6914]">Ubicación</h2>
                  </div>
                  <span className="text-[11.5px] text-[#8B8A7E]">{campo.departamento}</span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden rounded-b-3xl ring-1 ring-inset ring-[#E4E0D6]">
                    <MapaWrapper lat={campo.lat} lng={campo.lng} titulo={campo.titulo} />
                  </div>
                  <p className="absolute bottom-3 left-3 text-[11px] text-white cn-glass-dark border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5 pointer-events-none">
                    <MapPin className="h-3 w-3 shrink-0" />
                    Ubicación aproximada
                  </p>
                </div>
              </section>
            )}

            {/* Premium broker profile */}
            <section
              className="cn-reveal cn-card relative overflow-hidden rounded-3xl border border-[#E4E0D6] bg-gradient-to-br from-white to-[#FBFAF6] p-6"
              style={{ animationDelay: "0.18s" }}
            >
              <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-[#1C3311]/[0.04] blur-2xl pointer-events-none" />
              <div className="flex items-start gap-5">
                {escritorio.logo_url ? (
                  <img
                    src={escritorio.logo_url || "/placeholder.svg"}
                    alt={escritorio.nombre}
                    className="h-16 w-16 rounded-2xl object-cover border border-[#E4E0D6] shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-[#1C3311] flex items-center justify-center text-[#C49A3C] text-[22px] font-bold shrink-0 shadow-[0_8px_20px_-8px_rgba(28,51,17,.6)]">
                    {escritorio.nombre[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8B8A7E] mb-1">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-[0.12em]">Comercializado por</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[18px] tracking-tight">{escritorio.nombre}</p>
                    <BadgeCheck className="h-4.5 w-4.5 text-[#2D5018] shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#5C5B4F]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#2D5018]" />
                      Escritorio verificado
                    </span>
                    {escritorio.telefono && (
                      <a
                        href={`tel:${escritorio.telefono}`}
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#8B6914] hover:text-[#C49A3C] transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {escritorio.telefono}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: sticky premium contact card */}
          <aside className="lg:col-span-1">
            <div
              className="cn-reveal lg:sticky lg:top-24 space-y-4"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-[#E4E0D6] bg-white shadow-[0_30px_60px_-30px_rgba(28,51,17,.3)]">
                <div className="h-[3px] bg-gradient-to-r from-[#1C3311] via-[#3D6B22] to-[#C49A3C]" />
                <div className="p-6">
                  {campo.precio_usd && (
                    <div className="mb-5 pb-5 border-b border-[#EDEAE1]">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#8B8A7E] mb-1">Precio</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[13px] font-semibold text-[#8B6914]">USD</span>
                        <span className="text-[28px] font-bold tabular-nums leading-none">
                          {Number(campo.precio_usd).toLocaleString("es-UY")}
                        </span>
                      </div>
                    </div>
                  )}
                  <h2 className="text-[16px] font-semibold tracking-tight mb-1">Solicitar información</h2>
                  <p className="text-[12.5px] text-[#8B8A7E] mb-5 leading-relaxed">
                    Dejanos tus datos y el escritorio te contactará a la brevedad.
                  </p>
                  <ContactForm campoId={id} />
                </div>
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-[#E4E0D6] bg-white/70 cn-glass p-3 text-center">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#2D5018] mx-auto mb-1.5" />
                  <p className="text-[10.5px] font-medium text-[#5C5B4F] leading-tight">Verificado</p>
                </div>
                <div className="rounded-2xl border border-[#E4E0D6] bg-white/70 cn-glass p-3 text-center">
                  <BadgeCheck className="h-4.5 w-4.5 text-[#8B6914] mx-auto mb-1.5" />
                  <p className="text-[10.5px] font-medium text-[#5C5B4F] leading-tight">Sin comisión</p>
                </div>
                <div className="rounded-2xl border border-[#E4E0D6] bg-white/70 cn-glass p-3 text-center">
                  <Sprout className="h-4.5 w-4.5 text-[#2D5018] mx-auto mb-1.5" />
                  <p className="text-[10.5px] font-medium text-[#5C5B4F] leading-tight">Rural premium</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="border-t border-[#E4E0D6] bg-white/50 py-8 mt-6">
          <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#1C3311] flex items-center justify-center">
                <Sprout className="h-3.5 w-3.5 text-[#C49A3C]" />
              </div>
              <span className="text-[13px] font-semibold">
                Campo<span className="text-[#2D5018]">Net</span>
              </span>
            </div>
            <p className="text-center text-[12px] text-[#A8A698]">
              © 2026 CampoNet · Uruguay · Plataforma de compraventa de campos rurales
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
