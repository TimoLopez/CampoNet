'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Trash2, RotateCcw, BadgeCheck, Loader2 } from 'lucide-react'
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

type EstadoCampo = 'publicado' | 'borrador' | 'archivado' | 'vendido'

interface Props {
  campoId: string
  estado: EstadoCampo
  leadsCount: number
}

export default function CampoEstadoActions({ campoId, estado, leadsCount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [soldOpen, setSoldOpen] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function updateEstado(nuevoEstado: EstadoCampo) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('campos')
      .update({ estado: nuevoEstado })
      .eq('id', campoId)
    setLoading(false)
    if (error) {
      toast.error('Error al actualizar el estado.')
      return
    }
    const messages: Record<EstadoCampo, string> = {
      archivado: 'Campo archivado.',
      vendido: 'Campo marcado como vendido.',
      borrador: 'Campo reactivado como borrador.',
      publicado: 'Campo publicado.',
    }
    toast.success(messages[nuevoEstado])
    setArchiveOpen(false)
    setSoldOpen(false)
    setReactivateOpen(false)
    setDeleteOpen(false)
    router.push('/dashboard/campos')
    router.refresh()
  }

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/campos/${campoId}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as any).error ?? 'delete failed')
      }
      toast.success('Campo eliminado.')
      setDeleteOpen(false)
      router.push('/dashboard/campos')
      router.refresh()
    } catch {
      toast.error('Error al eliminar el campo.')
    } finally {
      setLoading(false)
    }
  }

  const isInactive = estado === 'archivado' || estado === 'vendido'

  return (
    <div className="flex flex-wrap gap-2">
      {/* Reactivar — only for archivado/vendido */}
      {isInactive && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReactivateOpen(true)}
            className="h-9 gap-1.5 text-[12.5px] font-medium text-[#2D5018] border-emerald-200/80 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl transition-all duration-150 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reactivar
          </Button>
          <Dialog open={reactivateOpen} onOpenChange={setReactivateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Reactivar este campo?</DialogTitle>
                <DialogDescription>
                  El campo pasará a borrador. Podés publicarlo nuevamente desde el formulario.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReactivateOpen(false)} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button
                  onClick={() => updateEstado('borrador')}
                  disabled={loading}
                  className="bg-[#1C3311] hover:bg-[#254516] cursor-pointer"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Reactivando...</> : 'Reactivar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Archivar — only for publicado/borrador */}
      {!isInactive && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setArchiveOpen(true)}
            className="h-9 gap-1.5 text-[12.5px] font-medium text-[#8B6914] border-[#C49A3C]/40 hover:bg-[#C49A3C]/8 hover:border-[#C49A3C]/60 rounded-xl transition-all duration-150 cursor-pointer"
          >
            <Archive className="h-3.5 w-3.5" />
            Archivar
          </Button>
          <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Archivar este campo?</DialogTitle>
                <DialogDescription>
                  El campo dejará de ser visible públicamente. Podés reactivarlo en cualquier momento.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setArchiveOpen(false)} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button
                  onClick={() => updateEstado('archivado')}
                  disabled={loading}
                  className="bg-[#1C3311] hover:bg-[#254516] cursor-pointer"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Archivando...</> : 'Archivar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Vendido — for publicado/borrador/archivado (not vendido) */}
      {estado !== 'vendido' && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoldOpen(true)}
            className="h-9 gap-1.5 text-[12.5px] font-medium text-emerald-700 border-emerald-200/80 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl transition-all duration-150 cursor-pointer"
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            Vendido
          </Button>
          <Dialog open={soldOpen} onOpenChange={setSoldOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Marcar como vendido?</DialogTitle>
                <DialogDescription>
                  El campo dejará de mostrarse públicamente y quedará como registro histórico. Los leads se conservan para futuras oportunidades.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSoldOpen(false)} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button
                  onClick={() => updateEstado('vendido')}
                  disabled={loading}
                  className="bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</> : 'Marcar como vendido'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Eliminar — always available */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDeleteOpen(true)}
        className="h-9 gap-1.5 text-[12.5px] font-medium text-red-600 border-red-200/80 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-150 cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Eliminar
      </Button>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este campo?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>Esta acción es permanente y no se puede deshacer. Se eliminarán todas las fotos.</p>
            {leadsCount > 0 && (
              <p className="text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2 text-sm">
                Este campo tiene <strong>{leadsCount} lead{leadsCount !== 1 ? 's' : ''}</strong>. Los leads se conservarán en el CRM con el nombre del campo como referencia.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="cursor-pointer"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Eliminando...</> : 'Eliminar campo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
