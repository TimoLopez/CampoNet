import { createClient } from '@/lib/supabase/server'
import { MapPin, Users, Eye, Plus, ArrowRight, Flame } from 'lucide-react'
import Link from 'next/link'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // Ronda 1: todo lo que no depende de IDs
  const [escritorioRes, camposRes, totalLeadsRes, leadsRes] = await Promise.all([
    supabase.from('escritorios').select('nombre').eq('id', user!.id).single(),
    supabase.from('campos').select('id').eq('escritorio_id', user!.id),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('escritorio_id', user!.id),
    supabase.from('leads').select('id, nombre, campos(titulo)').eq('escritorio_id', user!.id),
  ])

  const escritorio = escritorioRes.data
  const campoIds = (camposRes.data ?? []).map(c => c.id)
  const totalCampos = camposRes.data?.length ?? 0
  const totalLeads = totalLeadsRes.count ?? 0
  const leads = leadsRes.data ?? []
  const leadIds = leads.map(l => l.id)

  // Ronda 2: queries que necesitan IDs de la ronda 1
  let visitasMes = 0
  if (campoIds.length > 0) {
    const { count } = await supabase
      .from('visitas')
      .select('*', { count: 'exact', head: true })
      .in('campo_id', campoIds)
      .gte('created_at', startOfMonth)
    visitasMes = count ?? 0
  }

  let visitasRecientes: { lead_id: string | null }[] = []
  if (leadIds.length > 0) {
    const { data } = await supabase
      .from('visitas')
      .select('lead_id')
      .in('lead_id', leadIds)
      .gte('created_at', cutoff)
    visitasRecientes = data ?? []
  }

  // Calcular hot leads
  const visitCount = new Map<string, number>()
  for (const v of visitasRecientes) {
    if (v.lead_id) visitCount.set(v.lead_id, (visitCount.get(v.lead_id) ?? 0) + 1)
  }

  const hotLeads = leads
    .filter(l => (visitCount.get(l.id) ?? 0) >= 3)
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      nombre: l.nombre,
      campoTitulo: (l.campos as any)?.titulo ?? null,
      visitas: visitCount.get(l.id) ?? 0,
    }))

  const stats = [
    {
      label: 'Campos publicados',
      value: totalCampos,
      icon: MapPin,
      href: '/dashboard/campos',
      color: 'text-[#2D5018]',
      bg: 'bg-[#2D5018]/8',
    },
    {
      label: 'Leads recibidos',
      value: totalLeads,
      icon: Users,
      href: '/dashboard/crm',
      color: 'text-[#8B6914]',
      bg: 'bg-[#C49A3C]/10',
    },
    {
      label: 'Visitas este mes',
      value: visitasMes,
      icon: Eye,
      href: '/dashboard/crm',
      color: 'text-[#5C5B4F]',
      bg: 'bg-[#5C5B4F]/8',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-[#8B6914] uppercase tracking-widest mb-1">
          {greeting()}
        </p>
        <h1 className="text-3xl font-bold text-[#1A1A12] tracking-tight">
          {escritorio?.nombre ?? 'Mi Escritorio'}
        </h1>
        <p className="text-[#5C5B4F] mt-1">
          Resumen de tu actividad en CampoNet
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link
            key={label}
            href={href}
            className="group bg-white rounded-xl border border-[#E2DFD6] p-5 flex items-center gap-4 hover:border-[#C49A3C]/40 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-[#1A1A12]">{value}</p>
              <p className="text-xs text-[#5C5B4F] truncate">{label}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#C2BFB5] group-hover:text-[#C49A3C] transition-colors duration-150 shrink-0" />
          </Link>
        ))}
      </div>

      {/* Hot leads */}
      {hotLeads.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2DFD6] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#F2EFE8]">
            <Flame className="h-4 w-4 text-orange-500" />
            <h2 className="font-semibold text-[#1A1A12] text-sm">Leads calientes</h2>
          </div>
          <ul>
            {hotLeads.map(lead => (
              <li key={lead.id}>
                <Link
                  href={`/dashboard/crm/${lead.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[#F7F5F0] transition-colors border-b border-[#F2EFE8] last:border-0 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1A1A12]">{lead.nombre}</p>
                    {lead.campoTitulo && (
                      <p className="text-xs text-[#5C5B4F]">{lead.campoTitulo}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-orange-600 font-medium">
                      {lead.visitas} visitas
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#C2BFB5]" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state CTA */}
      {totalCampos === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-[#C49A3C]/40 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C3311] flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-6 w-6 text-[#C49A3C]" />
          </div>
          <h2 className="text-lg font-semibold text-[#1A1A12] mb-1">
            Publicá tu primer campo
          </h2>
          <p className="text-sm text-[#5C5B4F] max-w-xs mx-auto mb-5">
            Creá la ficha de un campo rural para comenzar a recibir consultas de compradores.
          </p>
          <Link
            href="/dashboard/campos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1C3311] text-white text-sm font-medium hover:bg-[#254516] transition-colors duration-150 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo campo
          </Link>
        </div>
      )}
    </div>
  )
}
