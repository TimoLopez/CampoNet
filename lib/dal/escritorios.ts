import { createClient as createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Escritorio } from '@/lib/types'

export async function getEscritorio(userId: string): Promise<Escritorio | null> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('escritorios')
    .select('*')
    .eq('id', userId)
    .single()
  return data ?? null
}

export async function getEscritorioNombre(userId: string): Promise<string | null> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('escritorios')
    .select('nombre')
    .eq('id', userId)
    .single()
  return data?.nombre ?? null
}

export async function getOrCreateEscritorio(userId: string, email: string): Promise<Escritorio> {
  const supabase = await createServerClient()
  const { data: existing } = await supabase
    .from('escritorios')
    .select('*')
    .eq('id', userId)
    .single()

  if (existing) return existing

  const nombre = email.split('@')[0]
  await supabase.from('escritorios').insert({ id: userId, nombre })

  const { data: created, error: fetchError } = await supabase
    .from('escritorios')
    .select('*')
    .eq('id', userId)
    .single()

  if (fetchError || !created) throw new Error('Failed to create escritorio')
  return created
}

export async function updateEscritorioLogo(userId: string, logoUrl: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('escritorios')
    .update({ logo_url: logoUrl })
    .eq('id', userId)
  if (error) throw error
}

// Para la página pública - busca escritorio por slug usando admin client (no auth context)
export async function getEscritorioBySlug(slug: string): Promise<Escritorio | null> {
  const { data, error } = await supabaseAdmin
    .from('escritorios')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

// Verifica si un slug está disponible (no usado por otro escritorio)
// Si `excludeUserId` se pasa, ignora ese escritorio (útil al actualizar el propio slug)
export async function checkSlugDisponible(slug: string, excludeUserId?: string): Promise<boolean> {
  let query = supabaseAdmin
    .from('escritorios')
    .select('id')
    .eq('slug', slug)

  if (excludeUserId) {
    query = query.neq('id', excludeUserId)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return !data // disponible si no encontró nada
}

export type UpdateEscritorioInput = {
  slug?: string | null
  tagline?: string | null
  cover_image_url?: string | null
  metricas_publicas?: boolean
}

export async function updateEscritorioPerfilPublico(
  userId: string,
  input: UpdateEscritorioInput
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('escritorios')
    .update(input)
    .eq('id', userId)
  if (error) throw error
}
