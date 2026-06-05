import { createClient } from '@/lib/supabase/server'
import PerfilForm from './PerfilForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: escritorio } = await supabase
    .from('escritorios')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
      <PerfilForm escritorio={escritorio} userEmail={user!.email!} />
    </div>
  )
}
