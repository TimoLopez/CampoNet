import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, MessageSquare, Users, Flame, CalendarClock, FileText } from 'lucide-react'
import { getReportePropietario } from '@/lib/dal/reportes'
import ReporteVisitasChart from './ReporteVisitasChart'
import PrintButton from './PrintButton'

const TIPO_LABEL: Record<string, string> = {
  ganadero: 'Ganadero',
  agricola: 'Agrícola',
  forestal: 'Forestal',
  mixto: 'Mixto',
  turistica: 'Turístico',
}

export default async function ReportePropietarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const reporte = await getReportePropietario(id, user!.id)
  if (!reporte) notFound()

  const { campo } = reporte

  const stats = [
    { label: 'Visitas online (30 días)', value: reporte.visitasOnline.total, icon: Eye, accentBg: 'bg-[#5C5B4F]/8', accentColor: 'text-[#5C5B4F]' },
    { label: 'Consultas recibidas', value: reporte.consultas, icon: MessageSquare, accentBg: 'bg-[#8B6914]/10', accentColor: 'text-[#8B6914]' },
    { label: 'Interesados (leads)', value: reporte.leads.total, icon: Users, accentBg: 'bg-[#1C3311]/8', accentColor: 'text-[#2D5018]' },
    { label: 'Visitas presenciales realizadas', value: reporte.visitasCoordinadas.realizadas, icon: CalendarClock, accentBg: 'bg-emerald-50', accentColor: 'text-emerald-600' },
  ]

  return (
    <div className="space-y-7 animate-fade-up max-w-3xl">

      {/* Toolbar (hidden when printing) */}
      <div className="print:hidden flex items-center justify-between">
        <Link
          href={`/dashboard/campos/${id}/estadisticas`}
          className="inline-flex items-center gap-1.5 text-[13px] text-[#8B8A7E] hover:text-[#1A1A12] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
          Volver a estadísticas
        </Link>
        <PrintButton />
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1C3311]/8 flex items-center justify-center">
            <FileText className="h-4 w-4 text-[#2D5018]" />
          </div>
          <div>
            <h1 className="text-[26px] font-bold text-[#1A1A12] tracking-tight">Reporte para el propietario</h1>
            <p className="text-sm text-[#8B8A7E]">
              {campo.titulo} · {campo.departamento}
              {campo.tipo ? ` · ${TIPO_LABEL[campo.tipo] ?? campo.tipo}` : ''}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-[#B0AD9E] mt-2">
          Generado el {new Date(reporte.generadoEl).toLocaleDateString('es-UY', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, accentBg, accentColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2DFD6] p-4 shadow-[var(--shadow-card)]">
            <div className={`w-9 h-9 rounded-xl ${accentBg} flex items-center justify-center mb-3`}>
              <Icon className={`h-4 w-4 ${accentColor}`} />
            </div>
            <p className="text-2xl font-bold text-[#1A1A12] tabular-nums leading-none">{value}</p>
            <p className="text-[11.5px] text-[#8B8A7E] mt-1.5 leading-snug">{label}</p>
          </div>
        ))}
      </div>

      {/* Visitas online trend */}
      <ReporteVisitasChart data={reporte.visitasOnline.porDia} totalVisitas={reporte.visitasOnline.total} />

      {/* Interesados destacados */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#F2EFE8] bg-gradient-to-r from-orange-50/70 to-transparent">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <span className="text-[13.5px] font-semibold text-[#1A1A12]">Interesados destacados</span>
        </div>
        {reporte.leads.calientes.length === 0 ? (
          <p className="text-[13px] text-[#8B8A7E] px-6 py-6">Sin interesados destacados por el momento.</p>
        ) : (
          <div className="divide-y divide-[#F7F5F0]">
            {reporte.leads.calientes.map(lead => (
              <div key={lead.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13.5px] font-semibold text-[#1A1A12]">{lead.nombre}</p>
                  {lead.score != null && (
                    <span className="text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200/80 px-2 py-0.5 rounded-full tabular-nums">
                      {lead.score}
                    </span>
                  )}
                </div>
                {lead.scoreJustificacion && (
                  <p className="text-[12.5px] text-[#5C5B4F] leading-relaxed italic mt-1">
                    "{lead.scoreJustificacion}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visitas coordinadas summary */}
      <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-[13.5px] font-semibold text-[#1A1A12] mb-3 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#C49A3C] inline-block" />
          Visitas presenciales coordinadas
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#1A1A12] tabular-nums">{reporte.visitasCoordinadas.programadas}</p>
            <p className="text-[11.5px] text-[#8B8A7E] mt-1">Programadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">{reporte.visitasCoordinadas.realizadas}</p>
            <p className="text-[11.5px] text-[#8B8A7E] mt-1">Realizadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#B0AD9E] tabular-nums">{reporte.visitasCoordinadas.canceladas}</p>
            <p className="text-[11.5px] text-[#8B8A7E] mt-1">Canceladas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
