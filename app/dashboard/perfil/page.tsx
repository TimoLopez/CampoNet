import { createClient } from '@/lib/supabase/server'
import PerfilForm from './PerfilForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let { data: escritorio } = await supabase
    .from('escritorios')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Fila inexistente (registrado antes del trigger) — crear con datos mínimos
  if (!escritorio) {
    const nombre = user!.email!.split('@')[0]
    await supabase.from('escritorios').insert({ id: user!.id, nombre })
    const { data: created } = await supabase
      .from('escritorios')
      .select('*')
      .eq('id', user!.id)
      .single()
    escritorio = created
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A12] mb-6">Mi Perfil</h1>
      <PerfilForm escritorio={escritorio} userEmail={user!.email!} />
    </div>
  )
}
