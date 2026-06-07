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
    <div className="space-y-7 animate-fade-up">
      <div>
        <h1 className="text-[26px] font-bold text-[#1A1A12] tracking-tight">Mi Perfil</h1>
        <p className="text-sm text-[#8B8A7E] mt-0.5">Información de tu escritorio rural</p>
      </div>
      <PerfilForm escritorio={escritorio} userEmail={user!.email!} />
    </div>
  )
}
