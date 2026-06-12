import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Consulta } from '@/lib/types'

export type CreateConsultaInput = {
  leadId: string
  campoId: string
  escritorioId: string
  mensaje: string
}

export async function createConsulta(input: CreateConsultaInput): Promise<void> {
  const { error } = await supabaseAdmin
    .from('consultas')
    .insert({
      lead_id: input.leadId,
      campo_id: input.campoId,
      escritorio_id: input.escritorioId,
      mensaje: input.mensaje,
    })
  if (error) throw error
}

export async function getConsultasForLead(leadId: string): Promise<Consulta[]> {
  const { data, error } = await supabaseAdmin
    .from('consultas')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getConsultasCountForCampo(campoId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('consultas')
    .select('*', { count: 'exact', head: true })
    .eq('campo_id', campoId)
  if (error) throw error
  return count ?? 0
}
