import { createClient } from '@/lib/supabase/server'
import { getLeadsByEscritorio } from '@/lib/dal/leads'

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') ?? undefined
    const campo = searchParams.get('campo') ?? undefined

    const leads = await getLeadsByEscritorio(user.id, { estado, campo })

    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Estado', 'Campo', 'Mensaje', 'Notas', 'Fecha consulta']
    const rows = leads.map(l => [
      escapeCsv(l.id),
      escapeCsv(l.nombre),
      escapeCsv(l.email),
      escapeCsv(l.telefono),
      escapeCsv(l.estado),
      escapeCsv(l.campo_titulo ?? l.campo_titulo_snapshot),
      escapeCsv(l.mensaje),
      escapeCsv(l.notas),
      escapeCsv(l.created_at ? new Date(l.created_at).toLocaleDateString('es-UY') : null),
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="leads.csv"',
      },
    })
  } catch (e) {
    console.error('[GET /api/leads/export]', e)
    return new Response('Error generando el CSV', { status: 500 })
  }
}
