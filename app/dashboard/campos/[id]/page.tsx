import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CampoForm from '@/components/campos/CampoForm'
import CampoEstadoActions from '@/components/campos/CampoEstadoActions'
import { getCampoById } from '@/lib/dal/campos'
import { getLeadCountForCampo } from '@/lib/dal/leads'

export default async function EditarCampoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [campo, leadsCount] = await Promise.all([
    getCampoById(id, user!.id),
    getLeadCountForCampo(id),
  ])

  if (!campo) notFound()

  return (
    <div className="space-y-7 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/campos"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#8B8A7E] hover:text-[#1A1A12] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
            Volver a mis campos
          </Link>
          <h1 className="text-[26px] font-bold text-[#1A1A12] mt-2 tracking-tight">Editar campo</h1>
          <p className="text-sm text-[#8B8A7E] mt-0.5 truncate max-w-[320px]">{campo.titulo}</p>
        </div>
        <CampoEstadoActions
          campoId={id}
          estado={campo.estado}
          leadsCount={leadsCount}
        />
      </div>
      <CampoForm initialData={campo} />
    </div>
  )
}
