import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo supera los 2MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const path = `${user.id}/logo.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabaseAdmin.storage
    .from('campo-fotos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('[POST logo] upload error:', uploadError)
    return NextResponse.json({ error: 'Error al subir el logo' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('campo-fotos')
    .getPublicUrl(path)

  const { error: updateError } = await supabaseAdmin
    .from('escritorios')
    .update({ logo_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('[POST logo] update error:', updateError)
    return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 })
  }

  return NextResponse.json({ url: publicUrl })
}
