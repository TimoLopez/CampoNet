export type Escritorio = {
  id: string
  nombre: string
  telefono: string | null
  descripcion: string | null
  logo_url: string | null
  created_at: string
}

export type Campo = {
  id: string
  escritorio_id: string
  titulo: string
  descripcion: string | null
  departamento: string
  hectareas: number
  precio_usd: number | null
  precio_ha_usd: number | null
  tipo: 'ganadero' | 'agricola' | 'forestal' | 'mixto' | 'turistica' | null
  agua: boolean
  acceso_ruta: boolean
  coneat: number | null
  caracteristicas: string[]
  lat: number | null
  lng: number | null
  fotos: string[]
  video_url: string | null
  estado: 'publicado' | 'borrador' | 'archivado' | 'vendido'
  created_at: string
  updated_at: string
}

export type Lead = {
  id: string
  escritorio_id: string
  campo_id: string | null
  campo_titulo_snapshot: string | null
  nombre: string
  email: string | null
  telefono: string | null
  mensaje: string | null
  estado: 'nuevo' | 'contactado' | 'negociacion' | 'cerrado' | 'descartado'
  notas: string | null
  created_at: string
  updated_at: string
}

export type Visita = {
  id: string
  campo_id: string
  lead_id: string | null
  session_id: string
  ip_hash: string | null
  user_agent: string | null
  created_at: string
}

export type LeadConVisitas = Lead & {
  total_visitas: number
  ultima_visita: string | null
  es_caliente: boolean
}

export type Consulta = {
  id: string
  lead_id: string
  campo_id: string | null
  escritorio_id: string
  mensaje: string
  created_at: string
}
