import { notFound } from 'next/navigation'
import { Eye, MessageSquare, Users, CalendarClock, TrendingUp } from 'lucide-react'
import { getReporteByToken } from '@/lib/dal/propietario'
import ReporteVisitasChart from '@/components/ReporteVisitasChart'

const TIPO_LABEL: Record<string, string> = {
  ganadero: 'Ganadero',
  agricola: 'Agrícola',
  forestal: 'Forestal',
  mixto: 'Mixto',
  turistica: 'Turístico',
}

export default async function PortalPropietarioPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const reporte = await getReporteByToken(token)
  if (!reporte) notFound()

  const { campo } = reporte
  const interesadosActivos = reporte.leads.total - reporte.leads.porEstado.descartado

  const stats = [
    { label: 'Visitas online (30 días)', value: reporte.visitasOnline.total, icon: Eye },
    { label: 'Consultas recibidas', value: reporte.consultas, icon: MessageSquare },
    { label: 'Interesados activos', value: interesadosActivos, icon: Users },
    { label: 'Visitas presenciales', value: reporte.visitasCoordinadas.realizadas, icon: CalendarClock },
  ]

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Header con branding del escritorio */}
      <header className="bg-[#1C3311] text-white px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">
            {campo.escritorio_nombre}
          </p>
          <h1 className="text-[20px] font-bold leading-snug">{campo.titulo}</h1>
          <p className="text-sm text-white/65 mt-0.5">
            {campo.departamento}
            {campo.tipo ? ` · ${TIPO_LABEL[campo.tipo] ?? campo.tipo}` : ''}
            {` · ${campo.hectareas} há`}
            {campo.precio_usd ? ` · USD ${campo.precio_usd.toLocaleString('es-UY')}` : ''}
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <p className="text-[11px] text-[#B0AD9E]">
          Actualizado el{' '}
          {new Date(reporte.actualizadoEl).toLocaleDateString('es-UY', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#E2DFD6] p-4">
              <Icon className="h-4 w-4 text-[#5C5B4F] mb-3" />
              <p className="text-2xl font-bold text-[#1A1A12] tabular-nums leading-none">
                {value}
              </p>
              <p className="text-[11px] text-[#8B8A7E] mt-1.5 leading-snug">{label}</p>
            </div>
          ))}
        </div>

        {/* Gráfico de visitas */}
        <ReporteVisitasChart
          data={reporte.visitasOnline.porDia}
          totalVisitas={reporte.visitasOnline.total}
        />

        {/* Estado de interesados — sin nombres, solo conteos */}
        {reporte.leads.total > 0 && (
          <div className="bg-white rounded-2xl border border-[#E2DFD6] p-5">
            <h2 className="text-[13px] font-semibold text-[#1A1A12] mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#2D5018]" />
              Estado de los interesados
            </h2>
            <div className="space-y-2.5">
              {reporte.leads.porEstado.negociacion > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-[#5C5B4F]">En negociación</span>
                  <span className="text-[13px] font-bold text-[#1A1A12] tabular-nums">
                    {reporte.leads.porEstado.negociacion}
                  </span>
                </div>
              )}
              {reporte.leads.porEstado.contactado > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-[#5C5B4F]">Contactados</span>
                  <span className="text-[13px] font-bold text-[#1A1A12] tabular-nums">
                    {reporte.leads.porEstado.contactado}
                  </span>
                </div>
              )}
              {reporte.leads.porEstado.nuevo > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-[#5C5B4F]">Nuevos por contactar</span>
                  <span className="text-[13px] font-bold text-[#1A1A12] tabular-nums">
                    {reporte.leads.porEstado.nuevo}
                  </span>
                </div>
              )}
              {reporte.leads.porEstado.cerrado > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-[#5C5B4F]">Cerrados</span>
                  <span className="text-[13px] font-bold text-emerald-600 tabular-nums">
                    {reporte.leads.porEstado.cerrado}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visitas presenciales coordinadas */}
        <div className="bg-white rounded-2xl border border-[#E2DFD6] p-5">
          <h2 className="text-[13px] font-semibold text-[#1A1A12] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#C49A3C] inline-block" />
            Visitas presenciales coordinadas
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-[#1A1A12] tabular-nums">
                {reporte.visitasCoordinadas.programadas}
              </p>
              <p className="text-[11px] text-[#8B8A7E] mt-1">Programadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 tabular-nums">
                {reporte.visitasCoordinadas.realizadas}
              </p>
              <p className="text-[11px] text-[#8B8A7E] mt-1">Realizadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#B0AD9E] tabular-nums">
                {reporte.visitasCoordinadas.canceladas}
              </p>
              <p className="text-[11px] text-[#8B8A7E] mt-1">Canceladas</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#B0AD9E] pb-6">
          Información confidencial · {campo.escritorio_nombre} · CampoNet
        </p>
      </main>
    </div>
  )
}
