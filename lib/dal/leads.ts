import { createClient as createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Lead } from '@/lib/types'

export type LeadRow = Lead & {
  campo_titulo: string | null
}

export type LeadBasico = {
  id: string
  nombre: string
  campo_titulo: string | null
}

export type CreateLeadInput = {
  campoId: string
  escritorioId: string
  campoTitulo: string
  nombre: string
  email: string | null
  telefono: string | null
  origen: 'pagina_publica' | 'buscador' | 'directo' | 'manual'
}

export async function getLeadsByEscritorio(
  escritorioId: string,
  filters: { estado?: string; campo?: string } = {}
): Promise<LeadRow[]> {
  const supabase = await createServerClient()
  let query = supabase
    .from('leads')
    .select('*, campos(titulo)')
    .eq('escritorio_id', escritorioId)
    .order('created_at', { ascending: false })
  if (filters.estado) query = query.eq('estado', filters.estado)
  if (filters.campo) query = query.eq('campo_id', filters.campo)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(l => ({
    ...l,
    campo_titulo: (l.campos as any)?.titulo ?? null,
    campos: undefined,
  })) as LeadRow[]
}

export async function getLeadById(leadId: string, escritorioId: string): Promise<(Lead & {
  campo_titulo: string | null
  campo_departamento: string | null
  campo_precio_usd: number | null
  campo_comision_pct: number | null
}) | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*, campos(titulo, departamento, precio_usd, comision_pct)')
    .eq('id', leadId)
    .eq('escritorio_id', escritorioId)
    .single()
  if (error) return null
  return {
    ...data,
    campo_titulo: (data.campos as any)?.titulo ?? null,
    campo_departamento: (data.campos as any)?.departamento ?? null,
    campo_precio_usd: (data.campos as any)?.precio_usd ?? null,
    campo_comision_pct: (data.campos as any)?.comision_pct ?? null,
    campos: undefined,
  } as any
}

export async function getLeadCountForCampo(campoId: string): Promise<number> {
  const supabase = await createServerClient()
  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('campo_id', campoId)
  if (error) throw error
  return count ?? 0
}

export async function getTotalLeadCount(escritorioId: string): Promise<number> {
  const supabase = await createServerClient()
  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('escritorio_id', escritorioId)
  if (error) throw error
  return count ?? 0
}

export async function getLeadsBasicoForEscritorio(escritorioId: string): Promise<LeadBasico[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('leads')
    .select('id, nombre, campos(titulo)')
    .eq('escritorio_id', escritorioId)
  if (error) throw error
  return (data ?? []).map(l => ({
    id: l.id,
    nombre: l.nombre,
    campo_titulo: (l.campos as any)?.titulo ?? null,
  }))
}

export async function upsertLead(input: CreateLeadInput): Promise<string> {
  if (input.email) {
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('email', input.email)
      .eq('campo_id', input.campoId)
      .maybeSingle()

    if (existing) {
      await supabaseAdmin
        .from('leads')
        .update({ estado: 'nuevo' })
        .eq('id', existing.id)
      return existing.id
    }
  }

  const { data: newLead, error } = await supabaseAdmin
    .from('leads')
    .insert({
      escritorio_id: input.escritorioId,
      campo_id: input.campoId,
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono,
      origen: input.origen,
    })
    .select('id')
    .single()

  if (error || !newLead) throw error ?? new Error('Lead creation failed')
  return newLead.id
}

export async function updateLeadScore(
  leadId: string,
  data: { score: number; score_categoria: string; score_justificacion: string }
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('leads')
    .update({
      score: data.score,
      score_categoria: data.score_categoria,
      score_justificacion: data.score_justificacion,
      score_updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)
  if (error) throw error
}
