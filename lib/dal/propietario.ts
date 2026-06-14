import { supabaseAdmin } from '@/lib/supabase/admin'
import { getVisitasByDayForCampo } from './visitas'
import { getConsultasCountForCampo } from './consultas'
import type { VisitasDiaData } from './visitas'
import type { VisitasCoordinadasStats } from './visitas-coordinadas'

export type LeadsPorEstado = {
  nuevo: number
  contactado: number
  negociacion: number
  cerrado: number
  descartado: number
}

export type ReportePortalPropietario = {
  campo: {
    id: string
    titulo: string
    departamento: string
    tipo: string | null
    hectareas: number
    precio_usd: number | null
    escritorio_nombre: string
  }
  visitasOnline: { total: number; porDia: VisitasDiaData[] }
  consultas: number
  leads: { total: number; porEstado: LeadsPorEstado }
  visitasCoordinadas: VisitasCoordinadasStats
  actualizadoEl: string
}

export async function getReporteByToken(token: string): Promise<ReportePortalPropietario | null> {
  const { data: campo, error } = await supabaseAdmin
    .from('campos')
    .select('id, titulo, departamento, tipo, hectareas, precio_usd, escritorios(nombre)')
    .eq('propietario_token', token)
    .single()

  if (error || !campo) return null

  const campoId = campo.id as string

  const { data: leadsData } = await supabaseAdmin
    .from('leads')
    .select('estado')
    .eq('campo_id', campoId)

  const leads = leadsData ?? []
  const porEstado: LeadsPorEstado = {
    nuevo: leads.filter(l => l.estado === 'nuevo').length,
    contactado: leads.filter(l => l.estado === 'contactado').length,
    negociacion: leads.filter(l => l.estado === 'negociacion').length,
    cerrado: leads.filter(l => l.estado === 'cerrado').length,
    descartado: leads.filter(l => l.estado === 'descartado').length,
  }

  // Fetch visitas coordinadas stats via supabaseAdmin (no auth context available in public token portal)
  const [visitasPorDia, consultasCount, vcResult] = await Promise.all([
    getVisitasByDayForCampo(campoId, 30),
    getConsultasCountForCampo(campoId),
    supabaseAdmin
      .from('visitas_coordinadas')
      .select('estado')
      .eq('campo_id', campoId),
  ])

  const visitasCoordinadasStats: VisitasCoordinadasStats = { programadas: 0, realizadas: 0, canceladas: 0 }
  for (const row of vcResult.data ?? []) {
    if (row.estado === 'programada') visitasCoordinadasStats.programadas++
    else if (row.estado === 'realizada') visitasCoordinadasStats.realizadas++
    else if (row.estado === 'cancelada') visitasCoordinadasStats.canceladas++
  }

  const totalVisitasOnline = visitasPorDia.reduce((sum, d) => sum + d.visitas, 0)

  return {
    campo: {
      id: campoId,
      titulo: campo.titulo as string,
      departamento: campo.departamento as string,
      tipo: campo.tipo as string | null,
      hectareas: campo.hectareas as number,
      precio_usd: campo.precio_usd as number | null,
      escritorio_nombre: (campo.escritorios as unknown as { nombre: string } | null)?.nombre ?? '',
    },
    visitasOnline: { total: totalVisitasOnline, porDia: visitasPorDia },
    consultas: consultasCount,
    leads: { total: leads.length, porEstado },
    visitasCoordinadas: visitasCoordinadasStats,
    actualizadoEl: new Date().toISOString(),
  }
}
