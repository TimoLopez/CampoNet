import { createClient } from '@/lib/supabase/server'
import { MapPin, Users, Eye, Plus, ArrowRight, Flame, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getCampoIdsForEscritorio } from '@/lib/dal/campos'
import { getTotalLeadCount, getLeadsBasicoForEscritorio } from '@/lib/dal/leads'
import { getVisitCountForCampos, getVisitasForLeads, computeVisitStats } from '@/lib/dal/visitas'
import { getEscritorioNombre } from '@/lib/dal/escritorios'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const cutoffDays = 14

  const [nombreEscritorio, campoIds, totalLeads, leads] = await Promise.all([
    getEscritorioNombre(user!.id),
    getCampoIdsForEscritorio(user!.id),
    getTotalLeadCount(user!.id),
    getLeadsBasicoForEscritorio(user!.id),
  ])

  const [visitasMes, visitasRecientes] = await Promise.all([
    getVisitCountForCampos(campoIds, startOfMonth),
    getVisitasForLeads(leads.map(l => l.id)),
  ])

  const visitStats = computeVisitStats(visitasRecientes, cutoffDays)

  const totalCampos = campoIds.length
  const hotLeads = leads
    .filter(l => (visitStats.get(l.id)?.count ?? 0) >= 3)
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      nombre: l.nombre,
      campoTitulo: l.campo_titulo,
      visitas: visitStats.get(l.id)?.count ?? 0,
    }))

  const stats = [
    {
      label: 'Campos publicados',
      value: totalCampos,
      icon: MapPin,
      href: '/dashboard/campos',
      iconBg: 'bg-[#1C3311]',
      iconColor: 'text-[#C49A3C]',
      accent: '#2D5018',
      trend: null,
    },
    {
      label: 'Leads recibidos',
      value: totalLeads,
      icon: Users,
      href: '/dashboard/crm',
      iconBg: 'bg-[#8B6914]/10',
      iconColor: 'text-[#8B6914]',
      accent: '#C49A3C',
      trend: null,
    },
    {
      label: 'Visitas este mes',
      value: visitasMes,
      icon: Eye,
      href: '/dashboard/crm',
      iconBg: 'bg-[#5C5B4F]/8',
      iconColor: 'text-[#5C5B4F]',
      accent: '#5C5B4F',
      trend: null,
    },
  ]

  return (
    <div className="space-y-8 animate-fade-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-5 bg-[#C49A3C]/40" aria-hidden />
            <p className="text-[11px] font-semibold text-[#8B6914] uppercase tracking-[0.14em]">
              {greeting()}
            </p>
            <span className="h-px w-5 bg-[#C49A3C]/40" aria-hidden />
          </div>
          <h1 className="text-[28px] font-bold text-[#1A1A12] tracking-tight leading-tight">
            {nombreEscritorio ?? 'Mi Escritorio'}
          </h1>
          <p className="text-sm text-[#8B8A7E] mt-1">Resumen de actividad · CampoNet</p>
        </div>
        <Link
          href="/dashboard/campos/nuevo"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C3311] text-white text-sm font-semibold hover:bg-[#254516] active:scale-[0.97] transition-all duration-150 shadow-[0_2px_8px_-2px_rgba(28,51,17,0.35)] hover:shadow-[0_4px_14px_-4px_rgba(28,51,17,0.5)] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nuevo campo
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, iconBg, iconColor }, i) => (
          <Link
            key={label}
            href={href}
            className="group relative bg-white rounded-2xl border border-[#E2DFD6] p-5 flex items-center gap-4 overflow-hidden hover:border-[#C49A3C]/30 hover:shadow-[0_6px_20px_-4px_rgba(28,51,17,0.11)] transition-all duration-200 cursor-pointer"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Subtle glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-[#C49A3C]/[0.03] to-transparent" />

            <div className={`relative w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-3xl font-bold text-[#1A1A12] leading-none tabular-nums">{value}</p>
              <p className="text-[12px] text-[#8B8A7E] mt-1.5 truncate">{label}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#C2BFB5] group-hover:text-[#C49A3C] group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
          </Link>
        ))}
      </div>

      {/* ── Hot leads ── */}
      {hotLeads.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2DFD6] overflow-hidden shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#F2EFE8] bg-gradient-to-r from-orange-50/70 to-transparent">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <h2 className="font-semibold text-[#1A1A12] text-[13.5px]">Leads calientes</h2>
              <p className="text-[11px] text-orange-500/70 leading-none mt-0.5">
                {hotLeads.length} activo{hotLeads.length !== 1 ? 's' : ''} · 3+ visitas en 14 días
              </p>
            </div>
            <Link
              href="/dashboard/crm"
              className="ml-auto text-[11px] font-medium text-[#8B6914] hover:text-[#C49A3C] transition-colors flex items-center gap-1 cursor-pointer"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-[#F7F5F0]">
            {hotLeads.map((lead, i) => (
              <li key={lead.id}>
                <Link
                  href={`/dashboard/crm/${lead.id}`}
                  className="group flex items-center justify-between px-5 py-3.5 hover:bg-[#F9F8F5] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#F2EFE8] border border-[#E2DFD6] flex items-center justify-center shrink-0 text-[11px] font-semibold text-[#5C5B4F]">
                      {lead.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#1A1A12] truncate">{lead.nombre}</p>
                      {lead.campoTitulo && (
                        <p className="text-[11px] text-[#8B8A7E] truncate">{lead.campoTitulo}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-orange-600 font-semibold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      {lead.visitas} visitas
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#C2BFB5] group-hover:text-[#C49A3C] group-hover:translate-x-0.5 transition-all duration-150" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Empty state ── */}
      {totalCampos === 0 && (
        <div className="relative bg-white rounded-2xl border border-dashed border-[#C49A3C]/35 p-10 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196,154,60,0.05) 0%, transparent 65%)' }} />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#1C3311] flex items-center justify-center mx-auto mb-5 shadow-[var(--shadow-lg)]">
              <MapPin className="h-7 w-7 text-[#C49A3C]" />
            </div>
            <h2 className="text-[17px] font-semibold text-[#1A1A12] mb-2">
              Publicá tu primer campo
            </h2>
            <p className="text-sm text-[#8B8A7E] max-w-xs mx-auto mb-6 leading-relaxed">
              Creá la ficha de un campo rural para comenzar a recibir consultas de compradores.
            </p>
            <Link
              href="/dashboard/campos/nuevo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C3311] text-white text-sm font-semibold hover:bg-[#254516] active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
            >
              <Plus className="h-4 w-4" />
              Nuevo campo
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
