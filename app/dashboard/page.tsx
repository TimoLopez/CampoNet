import { createClient } from '@/lib/supabase/server'
import { MapPin, Users, Eye, Plus, ArrowRight } from 'lucide-react'
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

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('nombre')
    .eq('id', user!.id)
    .single()

  const [{ count: totalCampos }, { count: totalLeads }] = await Promise.all([
    supabase.from('campos').select('*', { count: 'exact', head: true }).eq('escritorio_id', user!.id),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('escritorio_id', user!.id),
  ])

  const stats = [
    {
      label: 'Campos publicados',
      value: totalCampos ?? 0,
      icon: MapPin,
      href: '/dashboard/campos',
      color: 'text-[#2D5018]',
      bg: 'bg-[#2D5018]/8',
    },
    {
      label: 'Leads recibidos',
      value: totalLeads ?? 0,
      icon: Users,
      href: '/dashboard/crm',
      color: 'text-[#8B6914]',
      bg: 'bg-[#C49A3C]/10',
    },
    {
      label: 'Visitas este mes',
      value: 0,
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

      {/* Empty state CTA */}
      {(totalCampos ?? 0) === 0 && (
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
