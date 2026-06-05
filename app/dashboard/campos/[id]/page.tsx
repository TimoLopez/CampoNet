import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CampoForm from '@/components/campos/CampoForm'
import ArchiveCampoButton from '@/components/campos/ArchiveCampoButton'

export default async function EditarCampoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: campo } = await supabase
    .from('campos')
    .select('*')
    .eq('id', id)
    .eq('escritorio_id', user!.id)
    .single()

  if (!campo) notFound()

  const { count: leadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('campo_id', id)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/campos"
            className="inline-flex items-center gap-1.5 text-sm text-[#5C5B4F] hover:text-[#1A1A12] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mis campos
          </Link>
          <h1 className="text-2xl font-bold text-[#1A1A12] mt-2">Editar campo</h1>
        </div>
        <ArchiveCampoButton campoId={id} estado={campo.estado} tieneLeads={(leadsCount ?? 0) > 0} />
      </div>
      <CampoForm initialData={campo} />
    </div>
  )
}
