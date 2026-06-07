import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CampoForm from '@/components/campos/CampoForm'

export default function NuevoCampoPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/campos"
          className="inline-flex items-center gap-1.5 text-sm text-[#5C5B4F] hover:text-[#1A1A12] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis campos
        </Link>
        <h1 className="text-2xl font-bold text-[#1A1A12] mt-2 tracking-tight">Publicar nuevo campo</h1>
      </div>
      <CampoForm />
    </div>
  )
}
