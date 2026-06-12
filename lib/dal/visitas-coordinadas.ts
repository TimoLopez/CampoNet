import { createClient as createServerClient } from '@/lib/supabase/server'
import type { VisitaCoordinada } from '@/lib/types'

export async function getVisitasCoordinadasByLead(leadId: string): Promise<VisitaCoordinada[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('visitas_coordinadas')
    .select('*')
    .eq('lead_id', leadId)
    .order('fecha_hora', { ascending: true })
  if (error) throw error
  return data ?? []
}

export type ProximaVisita = VisitaCoordinada & {
  lead_nombre: string
  campo_titulo: string | null
}

export async function getProximasVisitas(escritorioId: string, limit = 5): Promise<ProximaVisita[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('visitas_coordinadas')
    .select('*, leads(nombre), campos(titulo)')
    .eq('escritorio_id', escritorioId)
    .eq('estado', 'programada')
    .gte('fecha_hora', new Date().toISOString())
    .order('fecha_hora', { ascending: true })
    .limit(limit)
  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map(row => ({
    ...row,
    lead_nombre: (row.leads as { nombre: string } | null)?.nombre ?? '',
    campo_titulo: (row.campos as { titulo: string } | null)?.titulo ?? null,
    leads: undefined,
    campos: undefined,
  }))
}

export type VisitasCoordinadasStats = {
  programadas: number
  realizadas: number
  canceladas: number
}

export async function getVisitasCoordinadasStatsForCampo(campoId: string): Promise<VisitasCoordinadasStats> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('visitas_coordinadas')
    .select('estado')
    .eq('campo_id', campoId)
  if (error) throw error
  const stats: VisitasCoordinadasStats = { programadas: 0, realizadas: 0, canceladas: 0 }
  for (const row of data ?? []) {
    if (row.estado === 'programada') stats.programadas++
    else if (row.estado === 'realizada') stats.realizadas++
    else if (row.estado === 'cancelada') stats.canceladas++
  }
  return stats
}
