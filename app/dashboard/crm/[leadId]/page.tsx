import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MessageSquare, Flame, MapPin, Calendar } from 'lucide-react'
import NotasLead from './NotasLead'

const ESTADO_STYLE: Record<string, string> = {
  nuevo:       'bg-blue-50 text-blue-700 border-blue-200',
  contactado:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  negociacion: 'bg-purple-50 text-purple-700 border-purple-200',
  cerrado:     'bg-green-50 text-green-700 border-green-200',
  descartado:  'bg-gray-100 text-gray-500 border-gray-200',
}

const ESTADO_LABEL: Record<string, string> = {
  nuevo: 'Nuevo', contactado: 'Contactado', negociacion: 'Negociación',
  cerrado: 'Cerrado', descartado: 'Descartado',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-UY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function LeadDetailPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lead } = await supabase
    .from('leads')
    .select('*, campos(titulo, departamento)')
    .eq('id', leadId)
    .eq('escritorio_id', user!.id)
    .single()

  if (!lead) notFound()

  const { data: visitas } = await supabase
    .from('visitas')
    .select('id, created_at, user_agent')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const esCaliente = (visitas ?? []).filter(v => new Date(v.created_at) > cutoff).length >= 3

  const campo = lead.campos as { titulo: string; departamento: string } | null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/dashboard/crm"
          className="inline-flex items-center gap-1.5 text-sm text-[#5C5B4F] hover:text-[#1A1A12] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a leads
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-[#1A1A12]">{lead.nombre}</h1>
          {esCaliente && <Flame className="h-5 w-5 text-orange-500" />}
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ESTADO_STYLE[lead.estado]}`}>
            {ESTADO_LABEL[lead.estado]}
          </span>
        </div>
        {campo && (
          <p className="flex items-center gap-1.5 text-sm text-[#5C5B4F] mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {campo.titulo} · {campo.departamento}
          </p>
        )}
      </div>

      {/* Datos de contacto */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 space-y-3">
        <h2 className="font-semibold text-[#1A1A12] text-sm">Datos de contacto</h2>
        {lead.email && (
          <div className="flex items-center gap-2 text-sm text-[#5C5B4F]">
            <Mail className="h-4 w-4 shrink-0" />
            <a href={`mailto:${lead.email}`} className="hover:text-[#1A1A12] transition-colors">{lead.email}</a>
          </div>
        )}
        {lead.telefono && (
          <div className="flex items-center gap-2 text-sm text-[#5C5B4F]">
            <Phone className="h-4 w-4 shrink-0" />
            <a href={`tel:${lead.telefono}`} className="hover:text-[#1A1A12] transition-colors">{lead.telefono}</a>
          </div>
        )}
        {lead.mensaje && (
          <div className="flex items-start gap-2 text-sm text-[#5C5B4F]">
            <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{lead.mensaje}</p>
          </div>
        )}
        <p className="flex items-center gap-1.5 text-xs text-[#5C5B4F] pt-1 border-t border-[#F2EFE8]">
          <Calendar className="h-3.5 w-3.5" />
          Consultó el {formatDate(lead.created_at)}
        </p>
      </div>

      {/* Notas */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6">
        <NotasLead leadId={leadId} initialNotas={lead.notas} />
      </div>

      {/* Historial de visitas */}
      <div className="bg-white rounded-xl border border-[#E2DFD6] p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#1A1A12] text-sm">
            Historial de visitas
            {esCaliente && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-orange-600 font-normal">
                <Flame className="h-3.5 w-3.5" /> Lead caliente
              </span>
            )}
          </h2>
          <span className="text-xs text-[#5C5B4F]">{visitas?.length ?? 0} visita{(visitas?.length ?? 0) !== 1 ? 's' : ''}</span>
        </div>
        {(!visitas || visitas.length === 0) ? (
          <p className="text-sm text-[#5C5B4F]">Sin historial de visitas registrado.</p>
        ) : (
          <div className="space-y-2">
            {visitas.map(v => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-[#F2EFE8] last:border-0">
                <p className="text-sm text-[#1A1A12]">{formatDate(v.created_at)}</p>
                {new Date(v.created_at) > cutoff && (
                  <span className="text-xs text-orange-500 font-medium">últimos 14 días</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
