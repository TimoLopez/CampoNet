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
