import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, MapPin, LayoutGrid } from 'lucide-react'
import CampoCard from '@/components/campos/CampoCard'

export default async function CamposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: campos } = await supabase
    .from('campos')
    .select('*')
    .eq('escritorio_id', user!.id)
    .order('created_at', { ascending: false })

  const count = campos?.length ?? 0

  return (
    <div className="space-y-7 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-bold text-[#1A1A12] tracking-tight">Mis Campos</h1>
            {count > 0 && (
              <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold bg-[#1C3311]/8 text-[#1C3311] border border-[#1C3311]/10">
                {count}
              </span>
            )}
          </div>
          <p className="text-sm text-[#8B8A7E] mt-0.5">
            {count === 0
              ? 'Publicá tu primer campo para empezar'
              : `${count} campo${count !== 1 ? 's' : ''} en tu portafolio`}
          </p>
        </div>

        <Link
          href="/dashboard/campos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C3311] text-white text-sm font-semibold hover:bg-[#254516] active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-[0_2px_8px_-2px_rgba(28,51,17,0.35)] hover:shadow-[0_4px_14px_-4px_rgba(28,51,17,0.5)] shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo campo
        </Link>
      </div>

      {/* Empty state */}
      {count === 0 ? (
        <div className="relative bg-white rounded-2xl border border-dashed border-[#C49A3C]/35 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,154,60,0.05) 0%, transparent 65%)' }} />
          <div className="relative flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-[#1C3311]/6 ring-1 ring-[#1C3311]/10 flex items-center justify-center mb-5">
              <MapPin className="h-7 w-7 text-[#1C3311]/35" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#1A1A12] mb-2">Sin campos publicados</h3>
            <p className="text-sm text-[#8B8A7E] max-w-[260px] mb-7 leading-relaxed">
              Publicá tu primer campo para que compradores puedan encontrarlo y contactarte.
            </p>
            <Link
              href="/dashboard/campos/nuevo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C3311] text-white text-sm font-semibold hover:bg-[#254516] active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
            >
              <Plus className="h-4 w-4" />
              Publicar primer campo
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campos!.map(campo => (
            <CampoCard key={campo.id} campo={campo} />
          ))}
        </div>
      )}
    </div>
  )
}
