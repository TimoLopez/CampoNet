import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash, randomUUID } from 'crypto'
import { getPrevLeadIdForSession, registerVisita } from '@/lib/dal/visitas'
import { RegisterVisitaSchema } from '@/lib/schemas/visita'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegisterVisitaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { campoId } = parsed.data

    const cookieStore = await cookies()
    const existing = cookieStore.get('session_id')?.value
    const sessionId = existing ?? randomUUID()
    const isNew = !existing

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
    const ipHash = ip ? createHash('sha256').update(ip).digest('hex') : null
    const userAgent = request.headers.get('user-agent') ?? null

    const prevLeadId = await getPrevLeadIdForSession(sessionId, campoId)

    await registerVisita({ campoId, sessionId, ipHash, userAgent, leadId: prevLeadId })

    const res = NextResponse.json({ ok: true })
    if (isNew) {
      res.cookies.set('session_id', sessionId, {
        maxAge: 60 * 60 * 24 * 90,
        path: '/',
        sameSite: 'lax',
        httpOnly: true,
      })
    }
    return res
  } catch (e) {
    console.error('[POST /api/visitas]', e)
    return NextResponse.json({ error: 'Error registering visit' }, { status: 500 })
  }
}
