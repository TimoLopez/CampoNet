// app/api/escritorios/check-slug/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkSlugDisponible } from '@/lib/dal/escritorios'

// Slug válido: minúsculas, números, guiones. 3-40 caracteres.
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const RESERVADOS = new Set([
  'admin', 'api', 'campos', 'campo', 'crm', 'dashboard', 'escritorios',
  'login', 'logout', 'registro', 'perfil', 'inteligencia', 'propietario',
  'www', 'app', 'help', 'about', 'pricing', 'blog', 'docs',
])

export async function POST(request: Request) {
  try {
    const { slug } = await request.json()

    if (typeof slug !== 'string' || slug.length < 3 || slug.length > 40) {
      return NextResponse.json({ disponible: false, motivo: 'El slug debe tener entre 3 y 40 caracteres' })
    }

    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json({ disponible: false, motivo: 'Solo letras, números y guiones (sin espacios)' })
    }

    if (RESERVADOS.has(slug)) {
      return NextResponse.json({ disponible: false, motivo: 'Este nombre está reservado' })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const disponible = await checkSlugDisponible(slug, user.id)
    return NextResponse.json({ disponible, motivo: disponible ? null : 'Ya está siendo usado por otro escritorio' })
  } catch (e) {
    console.error('[POST /api/escritorios/check-slug]', e)
    return NextResponse.json({ error: 'Error verificando el slug' }, { status: 500 })
  }
}
