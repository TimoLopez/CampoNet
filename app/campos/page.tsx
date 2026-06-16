import { Suspense } from 'react'
import Link from 'next/link'
import { Sprout, MapPin } from 'lucide-react'
import { getCamposPublicos } from '@/lib/dal/campos'
import type { CamposPublicosFilters } from '@/lib/dal/campos'
import CampoCard from './CampoCard'
import CamposFilters from './CamposFilters'
import MarkSource from '@/components/MarkSource'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function parseNum(val: string | string[] | undefined): number | undefined {
  const s = typeof val === 'string' ? val.trim() : ''
  if (!s) return undefined
  const n = Number(s)
  return isNaN(n) ? undefined : n
}

function parseStr(val: string | string[] | undefined): string | undefined {
  const s = typeof val === 'string' ? val.trim() : ''
  return s || undefined
}

export default async function CamposPage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters: CamposPublicosFilters = {
    departamento: parseStr(params.departamento),
    tipo: parseStr(params.tipo),
    precioMin: parseNum(params.precioMin),
    precioMax: parseNum(params.precioMax),
    hectareasMin: parseNum(params.hectareasMin),
  }

  const campos = await getCamposPublicos(filters)

  const hasFilters = Object.values(filters).some(v => v != null)

  return (
    <>
      {/* Keyframes + design primitives */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes cnFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
            .cn-reveal { opacity: 0; animation: cnFadeUp .7s cubic-bezier(.22,.61,.36,1) forwards; }
            .cn-glass { background: rgba(255,255,255,.7); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%); }
            .cn-card { transition: transform .35s cubic-bezier(.22,.61,.36,1), box-shadow .35s cubic-bezier(.22,.61,.36,1), border-color .35s ease; }
            .cn-card:hover { transform: translateY(-4px); box-shadow: 0 24px 50px -24px rgba(28,51,17,.35); border-color: rgba(196,154,60,.45); }
            @media (prefers-reduced-motion: reduce) {
              .cn-reveal { animation: none; opacity: 1; transform: none; }
              .cn-card:hover { transform: none; }
            }
          `,
        }}
      />

      <div className="min-h-screen bg-[#F4F2EB] text-[#1A1A12] antialiased">
        <MarkSource source="buscador" />
        {/* Navbar */}
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
            <div className="flex items-center gap-1.5 text-[12px] text-[#5C5B4F] rounded-full bg-white/70 border border-[#E4E0D6] px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#8B6914]" />
              <span className="font-medium">Uruguay</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-5 py-10">
          {/* Page header */}
          <div className="cn-reveal mb-8" style={{ animationDelay: '0.05s' }}>
            <h1 className="text-[28px] md:text-[36px] font-bold tracking-tight leading-tight">
              Campos disponibles
            </h1>
            <p className="text-[13.5px] text-[#7A7A6E] mt-1">
              {campos.length === 0
                ? 'No se encontraron resultados'
                : `${campos.length} ${campos.length === 1 ? 'propiedad' : 'propiedades'} publicada${campos.length === 1 ? '' : 's'}`}
              {hasFilters && ' con los filtros aplicados'}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters sidebar */}
            <aside className="w-full lg:w-64 shrink-0 cn-reveal" style={{ animationDelay: '0.08s' }}>
              {/* Mobile: collapsible */}
              <details className="lg:hidden">
                <summary className="flex items-center gap-2 cursor-pointer list-none bg-white rounded-2xl border border-[#E2DFD6] px-4 py-3 text-[13.5px] font-semibold text-[#1A1A12] select-none">
                  <svg className="h-4 w-4 text-[#8B6914]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 000 2h18a1 1 0 000-2H3zM7 11a1 1 0 000 2h10a1 1 0 000-2H7zM10 18a1 1 0 000 2h4a1 1 0 000-2h-4z" />
                  </svg>
                  Filtros
                  {hasFilters && (
                    <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1C3311] text-[10px] font-bold text-white">
                      {Object.values(filters).filter(v => v !== undefined).length}
                    </span>
                  )}
                </summary>
                <div className="mt-2">
                  <Suspense>
                    <CamposFilters />
                  </Suspense>
                </div>
              </details>

              {/* Desktop: always visible */}
              <div className="hidden lg:block lg:sticky lg:top-24">
                <Suspense>
                  <CamposFilters />
                </Suspense>
              </div>
            </aside>

            {/* Main grid */}
            <main className="flex-1 cn-reveal" style={{ animationDelay: '0.12s' }}>
              {campos.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border border-dashed border-[#D8D4C8] bg-white/50">
                  <div className="w-16 h-16 rounded-2xl bg-[#EAE7DC] flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-[#B0AD9E]" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[16px] text-[#3D3D30]">
                      No hay campos con ese filtro
                    </p>
                    <p className="text-[13px] text-[#8B8A7E] mt-1">
                      Probá cambiar o eliminar los filtros aplicados.
                    </p>
                  </div>
                  <Link
                    href="/campos"
                    className="text-[13px] font-medium text-[#2D5018] hover:text-[#C49A3C] transition-colors underline underline-offset-2"
                  >
                    Ver todos los campos
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {campos.map(campo => (
                    <CampoCard key={campo.id} campo={campo} />
                  ))}
                </div>
              )}
            </main>
          </div>
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
