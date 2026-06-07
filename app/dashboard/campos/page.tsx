import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, MapPin } from 'lucide-react'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#1A1A12] tracking-tight">Mis Campos</h1>
            {count > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1C3311]/8 text-[#1C3311] border border-[#1C3311]/12 leading-none">
                {count}
              </span>
            )}
          </div>
          <p className="text-sm text-[#5C5B4F] mt-0.5">
            {count === 0
              ? 'Publicá tu primer campo para empezar'
              : `${count} campo${count !== 1 ? 's' : ''} en tu portafolio`}
          </p>
        </div>
        <Link
          href="/dashboard/campos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C3311] text-white text-sm font-semibold hover:bg-[#254516] active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nuevo campo
        </Link>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-[#C49A3C]/40 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C3311]/6 flex items-center justify-center mb-4 ring-1 ring-[#1C3311]/8">
            <MapPin className="h-7 w-7 text-[#1C3311]/40" />
          </div>
          <h3 className="text-base font-semibold text-[#1A1A12] mb-1.5">Sin campos publicados</h3>
          <p className="text-sm text-[#5C5B4F] max-w-[280px] mb-6 leading-relaxed">
            Publicá tu primer campo para que compradores puedan encontrarlo.
          </p>
          <Link
            href="/dashboard/campos/nuevo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1C3311] text-white text-sm font-semibold hover:bg-[#254516] active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Publicar primer campo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campos!.map(campo => <CampoCard key={campo.id} campo={campo} />)}
        </div>
      )}
    </div>
  )
}
