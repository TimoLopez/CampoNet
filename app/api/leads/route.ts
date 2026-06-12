import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { upsertLead } from '@/lib/dal/leads'
import { createConsulta } from '@/lib/dal/consultas'
import { associateVisitasToLead } from '@/lib/dal/visitas'
import { CreateLeadSchema } from '@/lib/schemas/lead'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = CreateLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { campoId, nombre, email, telefono, mensaje } = parsed.data

    const { data: campo } = await supabaseAdmin
      .from('campos')
      .select('escritorio_id, titulo')
      .eq('id', campoId)
      .single()

    if (!campo) return NextResponse.json({ error: 'Campo no encontrado' }, { status: 404 })

    const leadId = await upsertLead({
      campoId,
      escritorioId: campo.escritorio_id,
      campoTitulo: campo.titulo,
      nombre,
      email: email ?? null,
      telefono: telefono ?? null,
    })

    await createConsulta({
      leadId,
      campoId,
      escritorioId: campo.escritorio_id,
      mensaje: mensaje ?? '(sin mensaje)',
    })

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session_id')?.value
    if (sessionId) {
      await associateVisitasToLead(sessionId, campoId, leadId)
    }

    // Fire-and-forget: calcular score IA sin bloquear la respuesta
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    fetch(`${appUrl}/api/ia/score-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    }).catch(() => {})

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
    console.error('[POST /api/leads]', e)
    return NextResponse.json({ error: 'Error procesando la consulta' }, { status: 500 })
  }
}
