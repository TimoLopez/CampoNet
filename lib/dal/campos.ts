import { createClient as createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Campo } from '@/lib/types'

export type CampoPublico = Campo & {
  escritorios: {
    nombre: string
    telefono: string | null
    logo_url: string | null
  }
}

export async function getCamposByEscritorio(escritorioId: string): Promise<Campo[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('campos')
    .select('*')
    .eq('escritorio_id', escritorioId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getCampoIdsForEscritorio(escritorioId: string): Promise<string[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('campos')
    .select('id')
    .eq('escritorio_id', escritorioId)
  if (error) throw error
  return (data ?? []).map(c => c.id)
}

export async function getCampoById(id: string, escritorioId: string): Promise<Campo | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('campos')
    .select('*')
    .eq('id', id)
    .eq('escritorio_id', escritorioId)
    .single()
  if (error) return null
  return data
}

export async function getCampoPublico(id: string): Promise<CampoPublico | null> {
  const { data, error } = await supabaseAdmin
    .from('campos')
    .select('*, escritorios(nombre, telefono, logo_url)')
    .eq('id', id)
    .eq('estado', 'publicado')
    .single()
  if (error) return null
  return data as CampoPublico
}

export async function getCamposForSelect(escritorioId: string): Promise<{ id: string; titulo: string }[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('campos')
    .select('id, titulo')
    .eq('escritorio_id', escritorioId)
    .order('titulo')
  if (error) throw error
  return data ?? []
}

export async function deleteCampoWithCleanup(campoId: string, escritorioId: string): Promise<void> {
  const supabase = await createServerClient()
  const { data: campo, error: fetchError } = await supabase
    .from('campos')
    .select('id, titulo, fotos')
    .eq('id', campoId)
    .eq('escritorio_id', escritorioId)
    .single()

  if (fetchError || !campo) {
    const err = new Error('Campo not found') as Error & { code: string }
    err.code = 'NOT_FOUND'
    throw err
  }

  const { error: leadsError } = await supabaseAdmin
    .from('leads')
    .update({ campo_titulo_snapshot: campo.titulo, campo_id: null })
    .eq('campo_id', campoId)
  if (leadsError) throw leadsError

  const fotos: string[] = campo.fotos ?? []
  if (fotos.length > 0) {
    const paths = fotos.map((url: string) => url.split('/campo-fotos/')[1]).filter(Boolean)
    if (paths.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('campo-fotos')
        .remove(paths)
      if (storageError) console.error('[dal/campos] storage cleanup error:', storageError)
    }
  }

  const { error: deleteError } = await supabaseAdmin
    .from('campos')
    .delete()
    .eq('id', campoId)
  if (deleteError) throw deleteError
}
