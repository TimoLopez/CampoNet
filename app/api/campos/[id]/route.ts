import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { deleteCampoWithCleanup } from '@/lib/dal/campos'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await deleteCampoWithCleanup(id, user.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e.code === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    console.error('[DELETE /api/campos]', e)
    return NextResponse.json({ error: 'Error al eliminar el campo' }, { status: 500 })
  }
}
