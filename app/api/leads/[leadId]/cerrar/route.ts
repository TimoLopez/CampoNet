import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const BodySchema = z.object({
  descartarLeadIds: z.array(z.string().uuid()).default([]),
})

// POST /api/leads/[leadId]/cerrar
// Marca un lead como cerrado, el campo asociado como vendido (si aplica),
// y los leads indicados en descartarLeadIds como descartado.
// Verifica ownership de todos los registros contra el escritorio_id del usuario.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
    }
    const { descartarLeadIds } = parsed.data

    // 1. Lead principal — verificar ownership
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id, escritorio_id, campo_id')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    }
    if (lead.escritorio_id !== user.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    // 2. Marcar lead como cerrado
    const { error: updLeadError } = await supabaseAdmin
      .from('leads')
      .update({ estado: 'cerrado' })
      .eq('id', leadId)

    if (updLeadError) {
      console.error('[POST /api/leads/cerrar] upd lead error:', updLeadError)
      return NextResponse.json({ error: 'Error actualizando lead' }, { status: 500 })
    }

    // 3. Marcar campo como vendido (si existe y no estaba ya vendido)
    let campoMarcadoVendido = false
    if (lead.campo_id) {
      const { data: campo } = await supabaseAdmin
        .from('campos')
        .select('id, escritorio_id, estado, vendido_at')
        .eq('id', lead.campo_id)
        .single()

      if (campo && campo.escritorio_id === user.id) {
        const updates: Record<string, unknown> = { estado: 'vendido' }
        if (!campo.vendido_at) {
          updates.vendido_at = new Date().toISOString()
        }
        const { error: updCampoError } = await supabaseAdmin
          .from('campos')
          .update(updates)
          .eq('id', campo.id)
        if (updCampoError) {
          console.error('[POST /api/leads/cerrar] upd campo error:', updCampoError)
        } else {
          campoMarcadoVendido = true
        }
      }
    }

    // 4. Descartar leads seleccionados — solo los que pertenecen al mismo campo y escritorio
    let leadsDescartados = 0
    if (descartarLeadIds.length > 0 && lead.campo_id) {
      const { data: descartados, error: descartarError } = await supabaseAdmin
        .from('leads')
        .update({ estado: 'descartado' })
        .eq('escritorio_id', user.id)
        .eq('campo_id', lead.campo_id)
        .in('id', descartarLeadIds)
        .select('id')

      if (descartarError) {
        console.error('[POST /api/leads/cerrar] descartar error:', descartarError)
      } else {
        leadsDescartados = descartados?.length ?? 0
      }
    }

    return NextResponse.json({
      ok: true,
      campoMarcadoVendido,
      leadsDescartados,
    })
  } catch (e) {
    console.error('[POST /api/leads/cerrar]', e)
    return NextResponse.json({ error: 'Error procesando' }, { status: 500 })
  }
}
