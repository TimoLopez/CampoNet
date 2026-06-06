import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createHash, randomUUID } from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { campoId } = await request.json()
    if (!campoId) return NextResponse.json({ error: 'campoId required' }, { status: 400 })

    const cookieStore = await cookies()
    const existing = cookieStore.get('session_id')?.value
    const sessionId = existing ?? randomUUID()
    const isNew = !existing

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
    const ipHash = ip ? createHash('sha256').update(ip).digest('hex') : null
    const userAgent = request.headers.get('user-agent') ?? null

    await supabaseAdmin.from('visitas').insert({
      campo_id: campoId,
      session_id: sessionId,
      ip_hash: ipHash,
      user_agent: userAgent,
    })

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
  } catch {
    return NextResponse.json({ error: 'Error registering visit' }, { status: 500 })
  }
}
