import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEscritorioBySlug } from '@/lib/dal/escritorios'
import { getCamposPublicosPorEscritorio } from '@/lib/dal/campos'
import EscritorioHero from './EscritorioHero'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const escritorio = await getEscritorioBySlug(slug)
  if (!escritorio) return { title: 'Escritorio no encontrado' }

  const title = `${escritorio.nombre} · CampoNet`
  const description = escritorio.tagline ?? escritorio.descripcion?.slice(0, 160) ?? 'Cartera de campos rurales en Uruguay.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: escritorio.cover_image_url ? [escritorio.cover_image_url] : undefined,
    },
  }
}

export default async function EscritorioPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const escritorio = await getEscritorioBySlug(slug)
  if (!escritorio) notFound()

  const campos = await getCamposPublicosPorEscritorio(escritorio.id)

  return (
    <div className="min-h-screen bg-[#F7F5F0] pb-12">
      <EscritorioHero escritorio={escritorio} />

      <main className="max-w-3xl mx-auto px-4 mt-10 space-y-6">
        {/* Más componentes en tasks siguientes */}
        <div className="text-center text-sm text-[#8B8A7E]">
          {campos.length} {campos.length === 1 ? 'campo publicado' : 'campos publicados'}
        </div>
      </main>
    </div>
  )
}
