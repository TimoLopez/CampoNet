import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
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
          <h1 className="text-2xl font-bold text-[#1A1A12]">Mis Campos</h1>
          <p className="text-sm text-[#5C5B4F] mt-0.5">
            {count} campo{count !== 1 ? 's' : ''} publicado{count !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/campos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C3311] text-white text-sm font-medium hover:bg-[#254516] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo campo
        </Link>
      </div>

      {count === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-[#C49A3C]/40 p-12 text-center">
          <p className="text-[#5C5B4F] mb-4">Todavía no publicaste ningún campo.</p>
          <Link
            href="/dashboard/campos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C3311] text-white text-sm font-medium hover:bg-[#254516] transition-colors cursor-pointer"
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
