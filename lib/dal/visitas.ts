import { createClient as createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type VisitStats = {
  count: number
  ultima: string | null
  esCaliente: boolean
}

export type RegisterVisitaInput = {
  campoId: string
  sessionId: string
  ipHash: string | null
  userAgent: string | null
  leadId: string | null
}

// Pure function — no DB calls. Extract visit stats from a flat list of visitas.
export function computeVisitStats(
  visitas: Array<{ lead_id: string | null; created_at: string }>,
  cutoffDays = 14
): Map<string, VisitStats> {
  const cutoff = new Date(Date.now() - cutoffDays * 24 * 60 * 60 * 1000)
  const map = new Map<string, VisitStats>()

  for (const v of visitas) {
    if (!v.lead_id) continue
    const s = map.get(v.lead_id) ?? { count: 0, ultima: null, esCaliente: false }
    s.count++
    if (!s.ultima || v.created_at > s.ultima) s.ultima = v.created_at
    map.set(v.lead_id, s)
  }

  for (const [leadId, stats] of map) {
    const recentCount = visitas.filter(
      v => v.lead_id === leadId && new Date(v.created_at) > cutoff
    ).length
    stats.esCaliente = recentCount >= 3
  }

  return map
}

export async function getVisitasForLeads(
  leadIds: string[]
): Promise<Array<{ lead_id: string | null; created_at: string }>> {
  if (leadIds.length === 0) return []
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('visitas')
    .select('lead_id, created_at')
    .in('lead_id', leadIds)
  if (error) throw error
  return data ?? []
}

export async function getVisitasForLead(
  leadId: string
): Promise<Array<{ id: string; created_at: string }>> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('visitas')
    .select('id, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getVisitCountForCampos(
  campoIds: string[],
  since: Date
): Promise<number> {
  if (campoIds.length === 0) return 0
  const supabase = await createServerClient()
  const { count, error } = await supabase
    .from('visitas')
    .select('*', { count: 'exact', head: true })
    .in('campo_id', campoIds)
    .gte('created_at', since.toISOString())
  if (error) throw error
  return count ?? 0
}

export async function getPrevLeadIdForSession(
  sessionId: string,
  campoId: string
): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('visitas')
    .select('lead_id')
    .eq('session_id', sessionId)
    .eq('campo_id', campoId)
    .not('lead_id', 'is', null)
    .limit(1)
    .maybeSingle()
  return data?.lead_id ?? null
}

export async function registerVisita(input: RegisterVisitaInput): Promise<void> {
  const { error } = await supabaseAdmin.from('visitas').insert({
    campo_id: input.campoId,
    session_id: input.sessionId,
    ip_hash: input.ipHash,
    user_agent: input.userAgent,
    lead_id: input.leadId,
  })
  if (error) throw error
}

export async function associateVisitasToLead(
  sessionId: string,
  campoId: string,
  leadId: string
): Promise<void> {
  await supabaseAdmin
    .from('visitas')
    .update({ lead_id: leadId })
    .eq('session_id', sessionId)
    .eq('campo_id', campoId)
    .is('lead_id', null)
}

export type VisitasDiaData = {
  fecha: string // 'DD/MM'
  visitas: number
}

export async function getVisitasByDayForCampo(
  campoId: string,
  days = 30
): Promise<VisitasDiaData[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const { data, error } = await supabaseAdmin
    .from('visitas')
    .select('created_at')
    .eq('campo_id', campoId)
    .gte('created_at', since.toISOString())

  if (error) throw error

  // Build a map of date string -> count (UTC day)
  const countMap = new Map<string, number>()
  for (const row of data ?? []) {
    const d = new Date(row.created_at)
    // Zero-padded UTC date key: 'YYYY-MM-DD'
    const key = d.toISOString().slice(0, 10)
    countMap.set(key, (countMap.get(key) ?? 0) + 1)
  }

  // Generate array of last `days` days in chronological order
  const result: VisitasDiaData[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = date.toISOString().slice(0, 10)
    const dd = String(date.getUTCDate()).padStart(2, '0')
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
    result.push({ fecha: `${dd}/${mm}`, visitas: countMap.get(key) ?? 0 })
  }

  return result
}
