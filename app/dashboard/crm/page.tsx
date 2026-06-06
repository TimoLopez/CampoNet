import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import LeadRow from './LeadRow'
import CrmFilters from './CrmFilters'

interface PageProps {
  searchParams: Promise<{ estado?: string; campo?: string }>
}

export default async function CrmPage({ searchParams }: PageProps) {
  const { estado, campo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch leads with campo title
  let query = supabase
    .from('leads')
    .select('*, campos(titulo)')
    .eq('escritorio_id', user!.id)
    .order('created_at', { ascending: false })

  if (estado) query = query.eq('estado', estado)
  if (campo) query = query.eq('campo_id', campo)

  const { data: leads } = await query

  // Fetch visit stats for all leads
  const leadIds = (leads ?? []).map(l => l.id)
  const { data: visitas } = leadIds.length > 0
    ? await supabase
        .from('visitas')
        .select('lead_id, created_at')
        .in('lead_id', leadIds)
    : { data: [] }

  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  type VisitStats = { count: number; ultima: string; esCaliente: boolean }
  const visitasMap = new Map<string, VisitStats>()

  for (const v of visitas ?? []) {
    if (!v.lead_id) continue
    const s = visitasMap.get(v.lead_id) ?? { count: 0, ultima: v.created_at, esCaliente: false }
    s.count++
    if (v.created_at > s.ultima) s.ultima = v.created_at
    visitasMap.set(v.lead_id, s)
  }

  // Compute es_caliente per lead
  for (const [leadId, stats] of visitasMap) {
    const recent = (visitas ?? []).filter(
      v => v.lead_id === leadId && new Date(v.created_at) > cutoff
    )
    stats.esCaliente = recent.length >= 3
  }

  // Fetch campos for filter dropdown
  const { data: campos } = await supabase
    .from('campos')
    .select('id, titulo')
    .eq('escritorio_id', user!.id)
    .order('titulo')

  const rows = (leads ?? []).map(l => ({
    id: l.id,
    nombre: l.nombre,
    estado: l.estado,
    created_at: l.created_at,
    campo_titulo: (l.campos as any)?.titulo ?? null,
    total_visitas: visitasMap.get(l.id)?.count ?? 0,
    ultima_visita: visitasMap.get(l.id)?.ultima ?? null,
    es_caliente: visitasMap.get(l.id)?.esCaliente ?? false,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A12]">CRM — Leads</h1>
          <p className="text-sm text-[#5C5B4F] mt-0.5">{rows.length} lead{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <Suspense>
          <CrmFilters campos={campos ?? []} />
        </Suspense>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-[#C49A3C]/40 p-12 text-center">
          <p className="text-[#5C5B4F]">
            {estado || campo ? 'No hay leads con esos filtros.' : 'Todavía no recibiste ninguna consulta.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2DFD6] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2DFD6] bg-[#F7F5F0]">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#5C5B4F]">Lead</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#5C5B4F]">Estado</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#5C5B4F]">Visitas</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[#5C5B4F]">Consulta</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map(lead => <LeadRow key={lead.id} lead={lead} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
