import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getConsultasForLead } from '@/lib/dal/consultas'
import { getVisitasForLead } from '@/lib/dal/visitas'
import { updateLeadScore } from '@/lib/dal/leads'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { leadId } = await request.json()
    if (!leadId || typeof leadId !== 'string') {
      return NextResponse.json({ error: 'leadId requerido' }, { status: 400 })
    }

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id, nombre, created_at, campo_id, telefono')
      .eq('id', leadId)
      .single()
    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    }

    let campoInfo = 'Campo rural (sin información adicional)'
    if (lead.campo_id) {
      const { data: campo } = await supabaseAdmin
        .from('campos')
        .select('titulo, tipo, hectareas, precio_usd')
        .eq('id', lead.campo_id)
        .single()
      if (campo) {
        const partes = [campo.titulo]
        if (campo.tipo) partes.push(campo.tipo)
        if (campo.hectareas) partes.push(`${campo.hectareas} ha`)
        if (campo.precio_usd) partes.push(`USD ${Number(campo.precio_usd).toLocaleString('es-UY')}`)
        campoInfo = partes.join(', ')
      }
    }

    const [consultas, visitas] = await Promise.all([
      getConsultasForLead(leadId),
      getVisitasForLead(leadId),
    ])

    const diasDesdeContacto = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 86400000)
    const ultimaVisitaDias = visitas[0]
      ? Math.floor((Date.now() - new Date(visitas[0].created_at).getTime()) / 86400000)
      : null
    const mensajes = consultas.length > 0
      ? consultas.map((c, i) => `${i + 1}. "${c.mensaje}"`).join('\n')
      : '(sin mensajes)'

    const prompt = `Eres un asistente para escritorios inmobiliarios rurales en Uruguay.
Analiza este lead y asigna un score de intención de compra del 0 al 100.

Campo de interés: ${campoInfo}
Lead: ${lead.nombre}${lead.telefono ? ' (dejó teléfono)' : ' (solo email, sin teléfono)'}
Primera consulta: hace ${diasDesdeContacto} día${diasDesdeContacto !== 1 ? 's' : ''}
Visitas registradas al campo: ${visitas.length}${ultimaVisitaDias !== null ? ` (última hace ${ultimaVisitaDias} día${ultimaVisitaDias !== 1 ? 's' : ''})` : ''}

Mensajes enviados por el lead:
${mensajes}

Criterios de scoring:
- frio (0-30): consulta genérica, sin teléfono, pocas o ninguna visita
- tibio (31-70): preguntas específicas sobre el campo, varias visitas, deja teléfono
- caliente (71-100): menciona presupuesto disponible, urgencia temporal, financiamiento listo, o pide coordinar visita al campo

Responde ÚNICAMENTE con un JSON válido, sin texto adicional:
{"score": <número entero 0-100>, "categoria": "<frio|tibio|caliente>", "justificacion": "<una sola oración en español que explique el score>"}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 150,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as { score?: number; categoria?: string; justificacion?: string }

    if (typeof parsed.score !== 'number' || !parsed.categoria || !parsed.justificacion) {
      throw new Error('Respuesta de IA incompleta')
    }

    const VALID_CATEGORIAS = ['frio', 'tibio', 'caliente'] as const
    if (!VALID_CATEGORIAS.includes(parsed.categoria as 'frio' | 'tibio' | 'caliente')) {
      throw new Error(`Categoría de IA inválida: ${parsed.categoria}`)
    }

    const score = Math.max(0, Math.min(100, Math.round(parsed.score)))
    await updateLeadScore(leadId, {
      score,
      score_categoria: parsed.categoria,
      score_justificacion: parsed.justificacion,
    })

    return NextResponse.json({
      ok: true,
      score,
      categoria: parsed.categoria,
      justificacion: parsed.justificacion,
    })
  } catch (e) {
    console.error('[POST /api/ia/score-lead]', e)
    return NextResponse.json({ error: 'Error calculando el score' }, { status: 500 })
  }
}
