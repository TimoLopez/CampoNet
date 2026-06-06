import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { campoId, nombre, email, telefono, mensaje } = await request.json()

    if (!campoId || !nombre || (!email && !telefono)) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const { data: campo } = await supabaseAdmin
      .from('campos')
      .select('escritorio_id, titulo')
      .eq('id', campoId)
      .single()

    if (!campo) {
      return NextResponse.json({ error: 'Campo no encontrado' }, { status: 404 })
    }

    let leadId: string

    if (email) {
      const { data: existing } = await supabaseAdmin
        .from('leads')
        .select('id, notas')
        .eq('email', email)
        .eq('campo_id', campoId)
        .maybeSingle()

      if (existing) {
        const fecha = new Date().toLocaleDateString('es-UY')
        const newNotas = existing.notas
          ? `${existing.notas}\n\n[${fecha}] ${mensaje || '(sin mensaje)'}`
          : mensaje || ''

        await supabaseAdmin
          .from('leads')
          .update({ notas: newNotas, estado: 'nuevo' })
          .eq('id', existing.id)

        leadId = existing.id
      } else {
        const { data: newLead, error } = await supabaseAdmin
          .from('leads')
          .insert({
            escritorio_id: campo.escritorio_id,
            campo_id: campoId,
            nombre,
            email,
            telefono: telefono || null,
            mensaje: mensaje || null,
          })
          .select('id')
          .single()

        if (error || !newLead) throw error ?? new Error('Lead creation failed')
        leadId = newLead.id
      }
    } else {
      const { data: newLead, error } = await supabaseAdmin
        .from('leads')
        .insert({
          escritorio_id: campo.escritorio_id,
          campo_id: campoId,
          nombre,
          email: null,
          telefono,
          mensaje: mensaje || null,
        })
        .select('id')
        .single()

      if (error || !newLead) throw error ?? new Error('Lead creation failed')
      leadId = newLead.id
    }

    // Associate anonymous visits to this lead
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value

    if (sessionId) {
      await supabaseAdmin
        .from('visitas')
        .update({ lead_id: leadId })
        .eq('session_id', sessionId)
        .eq('campo_id', campoId)
        .is('lead_id', null)
    }

    // Email notification via Resend (optional — skipped if no API key)
    if (process.env.RESEND_API_KEY) {
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(campo.escritorio_id)

      if (user?.email) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'CampoNet <onboarding@resend.dev>',
          to: user.email,
          subject: `Nuevo lead en CampoNet — ${campo.titulo}`,
          html: `
            <p>${nombre} está interesado en tu campo <strong>"${campo.titulo}"</strong>.</p>
            <p><strong>Datos de contacto:</strong></p>
            <ul>
              <li>Email: ${email || 'no proporcionó'}</li>
              <li>Teléfono: ${telefono || 'no proporcionó'}</li>
              <li>Mensaje: "${mensaje || ''}"</li>
            </ul>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/crm/${leadId}">Ver lead en tu panel →</a></p>
          `,
        }).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true, leadId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error procesando la consulta' }, { status: 500 })
  }
}
