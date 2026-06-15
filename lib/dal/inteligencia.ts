// lib/dal/inteligencia.ts
import { createClient as createServerClient } from '@/lib/supabase/server'

export type FunnelStats = {
  visitasOnline: number
  consultas: number
  leadsActivos: number
  enNegociacion: number
  cerrados: number
}

export type CampoPerformance = {
  id: string
  titulo: string
  visitas: number
  consultas: number
  leads: number
  diasPublicado: number | null
  estado: string
}

export type TiempoVentaPorTipo = {
  tipo: string
  diasPromedio: number
  cantidad: number
}

export type OrigenLeadsStats = {
  pagina_publica: number
  buscador: number
  directo: number
  manual: number
}

export type ComisionesStats = {
  cerradoYTD: number       // USD ya cobrado en el año actual (estado cerrado)
  pipelineUSD: number      // USD potencial si se cierran los que están en negociación
  cantidadCerrados: number
  porMes: { mes: string; usd: number }[]
}

// === FUNNEL ===
export async function getFunnelStats(escritorioId: string): Promise<FunnelStats> {
  const supabase = await createServerClient()

  // Visitas online (a campos de este escritorio en últimos 90 días)
  const noventaDiasAtras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { count: visitasCount } = await supabase
    .from('visitas')
    .select('campos!inner(escritorio_id)', { count: 'exact', head: true })
    .eq('campos.escritorio_id', escritorioId)
    .gte('created_at', noventaDiasAtras)

  // Total de consultas
  const { count: consultasCount } = await supabase
    .from('consultas')
    .select('*', { count: 'exact', head: true })
    .eq('escritorio_id', escritorioId)

  // Leads por estado
  const { data: leadsByEstado } = await supabase
    .from('leads')
    .select('estado')
    .eq('escritorio_id', escritorioId)

  const counts = (leadsByEstado ?? []).reduce(
    (acc, l) => {
      acc[l.estado] = (acc[l.estado] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const leadsActivos = (counts.nuevo ?? 0) + (counts.contactado ?? 0) + (counts.negociacion ?? 0)

  return {
    visitasOnline: visitasCount ?? 0,
    consultas: consultasCount ?? 0,
    leadsActivos,
    enNegociacion: counts.negociacion ?? 0,
    cerrados: counts.cerrado ?? 0,
  }
}

// === PERFORMANCE POR CAMPO ===
export async function getPerformancePorCampo(escritorioId: string): Promise<CampoPerformance[]> {
  const supabase = await createServerClient()

  const { data: campos } = await supabase
    .from('campos')
    .select('id, titulo, estado, published_at, created_at')
    .eq('escritorio_id', escritorioId)
    .order('created_at', { ascending: false })

  if (!campos || campos.length === 0) return []

  const campoIds = campos.map(c => c.id)

  const [visitasRes, consultasRes, leadsRes] = await Promise.all([
    supabase.from('visitas').select('campo_id').in('campo_id', campoIds),
    supabase.from('consultas').select('campo_id').in('campo_id', campoIds),
    supabase.from('leads').select('campo_id').in('campo_id', campoIds),
  ])

  const countBy = (rows: { campo_id: string | null }[]) => {
    const map = new Map<string, number>()
    for (const r of rows ?? []) {
      if (!r.campo_id) continue
      map.set(r.campo_id, (map.get(r.campo_id) ?? 0) + 1)
    }
    return map
  }

  const visitasMap = countBy(visitasRes.data ?? [])
  const consultasMap = countBy(consultasRes.data ?? [])
  const leadsMap = countBy(leadsRes.data ?? [])

  return campos.map(c => {
    const ref = c.published_at ?? c.created_at
    const diasPublicado = ref ? Math.floor((Date.now() - new Date(ref).getTime()) / (24 * 60 * 60 * 1000)) : null
    return {
      id: c.id,
      titulo: c.titulo,
      visitas: visitasMap.get(c.id) ?? 0,
      consultas: consultasMap.get(c.id) ?? 0,
      leads: leadsMap.get(c.id) ?? 0,
      diasPublicado,
      estado: c.estado,
    }
  })
}

// === TIEMPOS DE VENTA POR TIPO ===
export async function getTiemposDeVenta(escritorioId: string): Promise<TiempoVentaPorTipo[]> {
  const supabase = await createServerClient()

  const { data } = await supabase
    .from('campos')
    .select('tipo, published_at, vendido_at')
    .eq('escritorio_id', escritorioId)
    .eq('estado', 'vendido')
    .not('published_at', 'is', null)
    .not('vendido_at', 'is', null)

  if (!data || data.length === 0) return []

  const groups = new Map<string, number[]>()
  for (const row of data) {
    const tipo = row.tipo ?? 'sin_tipo'
    const dias = Math.floor((new Date(row.vendido_at!).getTime() - new Date(row.published_at!).getTime()) / (24 * 60 * 60 * 1000))
    if (dias < 0) continue
    const arr = groups.get(tipo) ?? []
    arr.push(dias)
    groups.set(tipo, arr)
  }

  return Array.from(groups.entries()).map(([tipo, dias]) => ({
    tipo,
    diasPromedio: Math.round(dias.reduce((s, d) => s + d, 0) / dias.length),
    cantidad: dias.length,
  })).sort((a, b) => b.cantidad - a.cantidad)
}

// === ORIGEN DE LEADS ===
export async function getOrigenLeads(escritorioId: string): Promise<OrigenLeadsStats> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('leads')
    .select('origen')
    .eq('escritorio_id', escritorioId)

  const stats: OrigenLeadsStats = { pagina_publica: 0, buscador: 0, directo: 0, manual: 0 }
  for (const l of data ?? []) {
    const o = l.origen ?? 'directo'
    if (o in stats) stats[o as keyof OrigenLeadsStats]++
  }
  return stats
}

// === COMISIONES ===
export async function getComisionesStats(escritorioId: string): Promise<ComisionesStats> {
  const supabase = await createServerClient()

  // Leads cerrados + campos asociados (para precio + comision_pct)
  const { data: cerrados } = await supabase
    .from('leads')
    .select('id, estado, updated_at, campos(precio_usd, comision_pct)')
    .eq('escritorio_id', escritorioId)
    .eq('estado', 'cerrado')

  const inicioAnio = new Date(new Date().getFullYear(), 0, 1).getTime()
  let cerradoYTD = 0
  const porMesMap = new Map<string, number>()

  for (const lead of cerrados ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campo = lead.campos as any
    if (!campo?.precio_usd || !campo?.comision_pct) continue
    const usd = (campo.precio_usd * campo.comision_pct) / 100
    const fecha = new Date(lead.updated_at)
    if (fecha.getTime() >= inicioAnio) {
      cerradoYTD += usd
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      porMesMap.set(mes, (porMesMap.get(mes) ?? 0) + usd)
    }
  }

  // Pipeline: leads en negociación con campo asociado
  const { data: negociacion } = await supabase
    .from('leads')
    .select('campos(precio_usd, comision_pct)')
    .eq('escritorio_id', escritorioId)
    .eq('estado', 'negociacion')

  let pipelineUSD = 0
  for (const lead of negociacion ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const campo = lead.campos as any
    if (!campo?.precio_usd || !campo?.comision_pct) continue
    pipelineUSD += (campo.precio_usd * campo.comision_pct) / 100
  }

  // Por mes: últimos 12 meses
  const porMes: { mes: string; usd: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    porMes.push({ mes, usd: porMesMap.get(mes) ?? 0 })
  }

  return {
    cerradoYTD: Math.round(cerradoYTD),
    pipelineUSD: Math.round(pipelineUSD),
    cantidadCerrados: cerrados?.length ?? 0,
    porMes,
  }
}
