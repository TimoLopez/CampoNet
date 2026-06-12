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

export type CamposPublicosFilters = {
  departamento?: string
  tipo?: string
  precioMin?: number
  precioMax?: number
  hectareasMin?: number
}

export type CampoPublicoCard = {
  id: string
  titulo: string
  departamento: string
  hectareas: number | null
  precio_usd: number | null
  tipo: string | null
  fotos: string[]
  escritorio_nombre: string
}

export async function getCamposPublicos(filters: CamposPublicosFilters = {}): Promise<CampoPublicoCard[]> {
  let query = supabaseAdmin
    .from('campos')
    .select('id, titulo, departamento, hectareas, precio_usd, tipo, fotos, escritorios(nombre)')
    .eq('estado', 'publicado')
    .order('created_at', { ascending: false })

  if (filters.departamento) query = query.eq('departamento', filters.departamento)
  if (filters.tipo) query = query.eq('tipo', filters.tipo)
  if (filters.precioMin != null) query = query.gte('precio_usd', filters.precioMin)
  if (filters.precioMax != null) query = query.lte('precio_usd', filters.precioMax)
  if (filters.hectareasMin != null) query = query.gte('hectareas', filters.hectareasMin)

  const { data, error } = await query
  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((row) => ({
    id: row.id as string,
    titulo: row.titulo as string,
    departamento: row.departamento as string,
    hectareas: row.hectareas as number | null,
    precio_usd: row.precio_usd as number | null,
    tipo: row.tipo as string | null,
    fotos: (row.fotos ?? []) as string[],
    // Supabase returns a single object for many-to-one joins, never an array
    escritorio_nombre: (row.escritorios as { nombre: string } | null)?.nombre ?? '',
  }))
}

export async function getCamposSimilares(params: {
  campoId: string
  departamento: string
  tipo: string | null
  precioUsd: number | null
  limit?: number
}): Promise<CampoPublicoCard[]> {
  const { campoId, departamento, tipo, precioUsd, limit = 3 } = params

  const { data, error } = await supabaseAdmin
    .from('campos')
    .select('id, titulo, departamento, hectareas, precio_usd, tipo, fotos, escritorios(nombre)')
    .eq('estado', 'publicado')
    .eq('departamento', departamento)
    .neq('id', campoId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  if (!data?.length) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: CampoPublicoCard[] = (data as any[]).map(row => ({
    id: row.id as string,
    titulo: row.titulo as string,
    departamento: row.departamento as string,
    hectareas: row.hectareas as number | null,
    precio_usd: row.precio_usd as number | null,
    tipo: row.tipo as string | null,
    fotos: (row.fotos ?? []) as string[],
    escritorio_nombre: (row.escritorios as { nombre: string } | null)?.nombre ?? '',
  }))

  // Score: same tipo +3, price within 25% +3, price within 50% +1
  const scored = rows
    .map(c => {
      let score = 0
      if (tipo && c.tipo === tipo) score += 3
      if (precioUsd && c.precio_usd) {
        const deviation = Math.abs(c.precio_usd - precioUsd) / precioUsd
        if (deviation < 0.25) score += 3
        else if (deviation < 0.5) score += 1
      }
      return { ...c, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored.map(({ score: _score, ...c }) => c)
}
