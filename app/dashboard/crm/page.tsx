import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import LeadRow from './LeadRow'
import CrmFilters from './CrmFilters'
import ExportButton from './ExportButton'
import { Users } from 'lucide-react'
import { getLeadsByEscritorio } from '@/lib/dal/leads'
import { getVisitasForLeads, computeVisitStats } from '@/lib/dal/visitas'
import { getCamposForSelect } from '@/lib/dal/campos'

interface PageProps {
  searchParams: Promise<{ estado?: string; campo?: string }>
}

export default async function CrmPage({ searchParams }: PageProps) {
  const { estado, campo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [leads, campos] = await Promise.all([
    getLeadsByEscritorio(user!.id, { estado, campo }),
    getCamposForSelect(user!.id),
  ])

  const visitas = await getVisitasForLeads(leads.map(l => l.id))
  const visitStats = computeVisitStats(visitas)

  const rows = leads.map(l => ({
    id: l.id,
    nombre: l.nombre,
    estado: l.estado,
    created_at: l.created_at,
    campo_id: l.campo_id,
    campo_titulo: l.campo_titulo,
    campo_titulo_snapshot: l.campo_titulo_snapshot,
    total_visitas: visitStats.get(l.id)?.count ?? 0,
    ultima_visita: visitStats.get(l.id)?.ultima ?? null,
    es_caliente: visitStats.get(l.id)?.esCaliente ?? false,
  }))

  const hotCount = rows.filter(r => r.es_caliente).length

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-bold text-[#1A1A12] tracking-tight">CRM · Leads</h1>
            {rows.length > 0 && (
              <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold bg-[#1C3311]/8 text-[#1C3311] border border-[#1C3311]/10">
                {rows.length}
              </span>
            )}
            {hotCount > 0 && (
              <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200/80">
                🔥 {hotCount} caliente{hotCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-[#8B8A7E] mt-0.5">Consultas recibidas desde tus fichas públicas</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Suspense>
            <CrmFilters campos={campos} />
          </Suspense>
          <ExportButton estado={estado} campo={campo} />
        </div>
      </div>

      {/* Table or empty */}
      {rows.length === 0 ? (
        <div className="relative bg-white rounded-2xl border border-dashed border-[#C49A3C]/35 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,154,60,0.04) 0%, transparent 65%)' }} />
          <div className="relative flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-[#F2EFE8] border border-[#E2DFD6] flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-[#C2BFB5]" />
            </div>
            <p className="text-[15px] font-medium text-[#1A1A12] mb-1.5">
              {estado || campo ? 'Sin leads con esos filtros' : 'Todavía no recibiste consultas'}
            </p>
            <p className="text-sm text-[#8B8A7E] max-w-[280px] leading-relaxed">
              {estado || campo
                ? 'Probá cambiar o limpiar los filtros.'
                : 'Cuando alguien consulte en tus campos publicados, aparecerán aquí.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[#F2EFE8] bg-[#F9F8F5]">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#8B8A7E] uppercase tracking-wider">Lead</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#8B8A7E] uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#8B8A7E] uppercase tracking-wider">Visitas</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#8B8A7E] uppercase tracking-wider">Consulta</th>
                  <th className="px-5 py-3 w-12" />
                </tr>
              </thead>
              <tbody>
                {rows.map(lead => <LeadRow key={lead.id} lead={lead} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
