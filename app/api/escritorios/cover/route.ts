import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Sin archivo' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${user.id}/cover.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('escritorio-covers')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      console.error('[POST /api/escritorios/cover] upload error:', uploadError)
      return NextResponse.json({ error: 'Error al subir' }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage.from('escritorio-covers').getPublicUrl(path)
    const url = `${urlData.publicUrl}?t=${Date.now()}`

    await supabaseAdmin.from('escritorios').update({ cover_image_url: url }).eq('id', user.id)

    return NextResponse.json({ url })
  } catch (e) {
    console.error('[POST /api/escritorios/cover]', e)
    return NextResponse.json({ error: 'Error procesando' }, { status: 500 })
  }
}
