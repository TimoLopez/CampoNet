import { getCampoById } from './campos'
import { getVisitasByDayForCampo, type VisitasDiaData } from './visitas'
import { getLeadsByEscritorio } from './leads'
import { getConsultasCountForCampo } from './consultas'
import { getVisitasCoordinadasStatsForCampo, type VisitasCoordinadasStats } from './visitas-coordinadas'

export type LeadCaliente = {
  id: string
  nombre: string
  score: number | null
  scoreCategoria: 'frio' | 'tibio' | 'caliente' | null
  scoreJustificacion: string | null
  createdAt: string
}

export type ReportePropietario = {
  campo: {
    id: string
    titulo: string
    departamento: string
    tipo: string | null
    hectareas: number
    precio_usd: number | null
  }
  visitasOnline: { total: number; porDia: VisitasDiaData[] }
  consultas: number
  leads: { total: number; calientes: LeadCaliente[] }
  visitasCoordinadas: VisitasCoordinadasStats
  generadoEl: string
}

export async function getReportePropietario(campoId: string, escritorioId: string): Promise<ReportePropietario | null> {
  const campo = await getCampoById(campoId, escritorioId)
  if (!campo) return null

  const [visitasPorDia, leads, consultasCount, visitasCoordinadasStats] = await Promise.all([
    getVisitasByDayForCampo(campoId, 30),
    getLeadsByEscritorio(escritorioId, { campo: campoId }),
    getConsultasCountForCampo(campoId),
    getVisitasCoordinadasStatsForCampo(campoId),
  ])

  const totalVisitasOnline = visitasPorDia.reduce((sum, d) => sum + d.visitas, 0)

  const leadsCalientes: LeadCaliente[] = leads
    .filter(l => l.score_categoria === 'caliente')
    .map(l => ({
      id: l.id,
      nombre: l.nombre,
      score: l.score,
      scoreCategoria: l.score_categoria,
      scoreJustificacion: l.score_justificacion,
      createdAt: l.created_at,
    }))

  return {
    campo: {
      id: campo.id,
      titulo: campo.titulo,
      departamento: campo.departamento,
      tipo: campo.tipo,
      hectareas: campo.hectareas,
      precio_usd: campo.precio_usd,
    },
    visitasOnline: { total: totalVisitasOnline, porDia: visitasPorDia },
    consultas: consultasCount,
    leads: { total: leads.length, calientes: leadsCalientes },
    visitasCoordinadas: visitasCoordinadasStats,
    generadoEl: new Date().toISOString(),
  }
}
