import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: campo } = await supabase
    .from('campos')
    .select('id, titulo, fotos, escritorio_id')
    .eq('id', id)
    .eq('escritorio_id', user.id)
    .single()

  if (!campo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 1. Snapshot campo title into leads and null the FK
  const { error: leadsError } = await supabaseAdmin
    .from('leads')
    .update({ campo_titulo_snapshot: campo.titulo, campo_id: null })
    .eq('campo_id', id)

  if (leadsError) {
    console.error('[DELETE campo] leads update error:', leadsError)
    return NextResponse.json({ error: 'Failed to update leads' }, { status: 500 })
  }

  // 2. Delete photos from Storage
  const fotos: string[] = campo.fotos ?? []
  if (fotos.length > 0) {
    const paths = fotos
      .map((url: string) => url.split('/campo-fotos/')[1])
      .filter(Boolean)
    if (paths.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('campo-fotos')
        .remove(paths)
      if (storageError) {
        console.error('[DELETE campo] storage error:', storageError)
      }
    }
  }

  // 3. Hard delete the campo
  const { error: deleteError } = await supabaseAdmin
    .from('campos')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('[DELETE campo] delete error:', deleteError)
    return NextResponse.json({ error: 'Failed to delete campo' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
