'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  campoId: string
  estado: string
  tieneLeads: boolean
}

export default function ArchiveCampoButton({ campoId, estado, tieneLeads }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleArchive() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('campos').update({ estado: 'archivado' }).eq('id', campoId)
    setLoading(false)
    setArchiveOpen(false)
    if (error) {
      toast.error('Error al archivar el campo.')
    } else {
      toast.success('Campo archivado.')
      router.push('/dashboard/campos')
      router.refresh()
    }
  }

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('campos').delete().eq('id', campoId)
    setLoading(false)
    setDeleteOpen(false)
    if (error) {
      toast.error('Error al eliminar el campo.')
    } else {
      toast.success('Campo eliminado.')
      router.push('/dashboard/campos')
      router.refresh()
    }
  }

  return (
    <div className="flex gap-2">
      {estado !== 'archivado' && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setArchiveOpen(true)}
            className="gap-1.5 text-[#8B6914] border-[#C49A3C]/40 hover:bg-[#C49A3C]/10 cursor-pointer"
          >
            <Archive className="h-4 w-4" />
            Archivar
          </Button>
          <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Archivar este campo?</DialogTitle>
              <DialogDescription>
                El campo dejará de estar visible públicamente. Podés reactivarlo editándolo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setArchiveOpen(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button
                onClick={handleArchive}
                disabled={loading}
                className="bg-[#1C3311] hover:bg-[#254516] cursor-pointer"
              >
                {loading ? 'Archivando...' : 'Archivar'}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </>
      )}
      {!tieneLeads && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar este campo?</DialogTitle>
              <DialogDescription>
                Esta acción es permanente y no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading} className="cursor-pointer">
                {loading ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
